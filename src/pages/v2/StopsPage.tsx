

import React, { useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherMusic,
  FeatherPin,
  FeatherPlay,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherTrash,
} from "@subframe/core";
import { Drawer, Select } from "@/ui";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { useDepotStore } from "@/store/useDepotStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import { IDepot, depotCrud } from "@/types/IDepot";
import { IRoute, routeCrud } from "@/types/IRoute";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import RBAC from "@/components/RBAC";
import { RouteTable } from "@/ui/components/RouteTable";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { RegionSelect } from "@/components/RegionSelect";
import { EmptyState } from "@/components/EmptyState";
import { IStop, IStopWithAudio, stopCrud } from "@/types/IStop";
import { handleStopAudioGeneration } from "@/utils/fetchTTS";
import { StopDetailsCard } from "@/ui/components/StopDetailsCard";
import { AudioFileContainer } from "@/ui/components/AudioFileContainer";
import { CreateStopForm } from "@/ui/components/CreateStopForm";

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Sub-components ──────────────────────────────
function useStopsPageData() {
  const { selectedOrganization } = useOrganizationStore();
  const selectedRegion = useRegionStore((state) => state.selectedRegion);
  const { setSelectedRegion: setSelectedRegionInStore } = useRegionStore();
  const selectedDepot = useDepotStore((state) => state.selectedDepot);
  const { setSelectedDepot: setSelectedDepotInStore } = useDepotStore();
  const user = useLoggedUserStore((state) => state.user);

  const { data: regionData, refetch: refetchRegions } = regionCrud.useList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
  });

  const { data: depotData, refetch: refetchDepots } = depotCrud.useList({
    filters: { region_id: selectedRegion?.id || "", deleted: false },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedRegion?.id,
  });

  const { data: stopsData, refetch: refetchStops } = stopCrud.useList({
    filters: {
      depot_id: selectedDepot?.id || "",
      deleted: false,
      organization_id: selectedOrganization.id,
    },
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      return query.select(
        `*,
           stop_audios (
      id,
      url,
      file_name,file_size
    )
          `, // Verify this line. It should correctly reflect your schema relationships.
      );
    },
    skip: !selectedDepot?.id,
  });

  const regions = regionData?.data as IRegion[];
  const depots = depotData?.data as IDepot[];
  const stops = stopsData?.data as IStopWithAudio[];

  // Auto-select first region
  useEffect(() => {
    if (regions?.length > 0 && !selectedRegion) {
      setSelectedRegionInStore(regions[0]);
    }
  }, [regions, selectedRegion, setSelectedRegionInStore]);

  // Auto-select / clear depot
  useEffect(() => {
    if (!depots) return;
    if (depots.length === 0 && selectedDepot) {
      setSelectedDepotInStore(null);
    } else if (depots.length > 0 && !selectedDepot) {
      setSelectedDepotInStore(depots[0]);
    }
  }, [depots, selectedDepot, setSelectedDepotInStore]);

  // Refetch on dependency changes
  useEffect(() => {
    refetchRegions();
  }, [selectedOrganization, refetchRegions]);
  useEffect(() => {
    refetchDepots();
  }, [selectedRegion, refetchDepots]);
  useEffect(() => {
    refetchStops();
  }, [selectedDepot, selectedRegion, refetchStops]);

  return {
    user,
    regions,
    depots,
    stops,
    selectedRegion,
    selectedDepot,
    selectedOrganization,
    setSelectedRegionInStore,
    setSelectedDepotInStore,
    refetchStops,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StopsPage() {
  const navigate = useNavigate();
  const {
    user,
    regions,
    depots,
    stops,
    selectedRegion,
    selectedDepot,
    selectedOrganization,
    setSelectedRegionInStore,
    setSelectedDepotInStore,
    refetchStops,
  } = useStopsPageData();

  const { mutate: deleteStop } = stopCrud.useDelete();

  const [editData, setEditData] = React.useState<IStop | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleRegionChange = (val: string) =>
    setSelectedRegionInStore(regions.find((r) => r.id === val) || null);

  const handleDepotChange = (val: string) =>
    setSelectedDepotInStore(depots.find((d) => d.id === val) || null);

  const handleEditRoute = (routeId: string) => {
    navigate(
      `/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}/${routeId}`,
    );
  };

  const hasRegions = regions && regions.length > 0;
  const hasDepots = depots && depots.length > 0;
  const hasStops = stops && stops.length > 0;

  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handlePlayAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  // function to delete stop from supabase stops table and also delete the audio file from supabase storage and then delete stop audio record from stop_audios table if exists
  async function handleDeleteStop(stopId: string) {
    deleteStop(stopId, {
      onSuccess: () => {
        toast.success("Stop deleted successfully");
        refetchStops();
      },
      onError: (error) => {
        toast.error(
          `Error deleting route: ${error.message || "Unknown error"}`,
        );
      },
    });
  }

  async function deleteStopAudio(stop_audio_id: string) {
    try {
      // First, delete the stop_audio record from the stop_audios table
      const { data, error } = await supabase
        .from("stop_audios")
        .delete()
        .match({ id: stop_audio_id });
      if (error) {
        throw new Error(`Failed to delete stop audio: ${error.message}`);
      }
      console.log("Stop audio deleted successfully:", data);
      refetchStops(); // Refresh the stops data to reflect the deletion
    } catch (err) {
      console.error("Delete operation failed:", err);
    }
  }

  async function deleteAudioFile(fileUrl: string, stopId: string) {
    // Extract the path of the file from the URL
    const path = fileUrl.split("/").pop(); // adjust this line according to how your URLs are structured
    if (!path) {
      console.error("Invalid file path");
      return;
    }
    try {
      const { error: deleteError } = await supabase.storage

        .from("stops")
        .remove([`${stopId}/${path}`]);
      if (deleteError) {
        throw new Error(`Failed to delete file: ${deleteError.message}`);
      }
      console.log("File deleted successfully");
    } catch (err) {
      console.error("Delete operation failed:", err);
    }
  }

  // function to handle delete audio file and then stop audio record
  async function deleteAudioFileAndStopAudioRecord(
    fileUrl: string,
    stopId: string,
    stop_audio_id?: string,
  ) {
    await deleteAudioFile(fileUrl, stopId);
    if (stop_audio_id) {
      await deleteStopAudio(stop_audio_id);
    }
  }

  // function to handle delete audio file and then stop audio record and then delete the stop itself
  async function deleteAudioFileAndStopAudioRecordAndStop(
    fileUrl: string,
    stopId: string,
    stop_audio_id?: string,
  ) {
    await deleteAudioFile(fileUrl, stopId);
    await deleteStopAudio(stop_audio_id);
    await deleteStop(stopId);
    refetchStops();
  }

  const [generatingAudio, setGeneratingAudio] = React.useState<boolean>(false);

  const genAudio = async (text: string, stopId: string) => {
    try {
      setGeneratingAudio(true);
      const { fileUrl, size } = await handleStopAudioGeneration(text, stopId);
      console.log("Generated audio URL:", fileUrl, "Size:", size);
      refetchStops(); // Refresh the stops data to reflect the new audio
    } catch (err) {
      console.error("Error generating audio:", err);
    } finally {
      setGeneratingAudio(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-4 ">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Stops
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage Stops for your Depot
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:items-start gap-4">
        <span className="text-caption font-caption text-subtext-color">
          Showing records
        </span>

        {hasRegions && (
          <div className="flex items-end gap-2 mobile:grid mobile:grid-cols-2 mobile:w-full">
            {/* Region Select — restricted roles */}
            <RBAC features={[]} roles={["depot_admin", "region_admin"]}>
              <RegionSelect
                regions={regions.filter((r) => user?.region?.id === r.id)}
                selectedRegionId={selectedRegion?.id ?? ""}
                onValueChange={handleRegionChange}
              />
            </RBAC>

            {/* Region Select — admin roles */}
            <RBAC features={[]} roles={["master", "organization_admin"]}>
              <RegionSelect
                regions={regions}
                selectedRegionId={selectedRegion?.id ?? ""}
                onValueChange={handleRegionChange}
              />
            </RBAC>

            {/* Depot Select */}
            {hasDepots && (
              <RBAC features={[]} roles={["master", "organization_admin"]}>
                <Select
                  className="h-auto flex-none"
                  variant="outline"
                  label="Select Depot"
                  placeholder="Select Depot"
                  value={selectedDepot?.id ?? ""}
                  onValueChange={handleDepotChange}
                >
                  {depots.map((depot) => (
                    <Select.Item key={depot.id} value={depot.id}>
                      {depot.name}
                    </Select.Item>
                  ))}
                </Select>
              </RBAC>
            )}

            <Button
              variant="neutral-secondary"
              className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
              icon={<FeatherRefreshCw />}
              onClick={() => {
                toast.success("Stops refreshed successfully");
                refetchStops();
              }}
            >
              Refresh
            </Button>

            <RBAC
              features={[]}
              roles={[
                "region_admin",
                "organization_admin",
                "master",
                "depot_admin",
              ]}
            >
              <Button
                icon={<FeatherPlus />}
                disabled={!selectedDepot}
                onClick={() => setOpen(true)}
              >
                Add Stop
              </Button>
            </RBAC>
          </div>
        )}
      </div>

      {/* Content */}
      {hasStops ? (
        <div className="w-full flex-col items-start gap-2 grid md:grid-cols-1 lg:grid-cols-2">
          {stops.map((stop) => (
            <StopDetailsCard
              icon={<FeatherPin />}
              title={stop.name}
              downwardLatitude={stop.down_latitude}
              downwardLongitude={stop.down_longitude}
              upwardLatitude={stop.up_latitude}
              upwardLongitude={stop.up_longitude}
              onDeleteClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this stop? This action cannot be undone.",
                  )
                ) {
                  if (stop.stop_audios && stop.stop_audios.url) {
                    deleteAudioFileAndStopAudioRecordAndStop(
                      stop.stop_audios.url,
                      stop.id || "",
                      stop.stop_audios.id || undefined,
                    );
                  } else {
                    handleDeleteStop(stop.id || "");
                  }
                }
              }}
              onEditClick={() => {
                setOpen(true);
                setEditData(stop);
              }}
              audioFile={
                <AudioFileContainer
                  fileName={
                    stop.stop_audios?.file_name || "No Audio File Found"
                  }
                  fileSize={
                    stop.stop_audios?.file_size
                      ? `${((stop.stop_audios.file_size ?? 0) / 1024 / 1024).toFixed(2)} MB`
                      : "No Audio File Found"
                  }
                  isAudioAvailable={
                    stop.stop_audios && stop.stop_audios.url ? true : false
                  }
                  actions={
                    <>
                      <Button
                        className="h-8 w-auto flex-none"
                        disabled={generatingAudio}
                        variant="brand-primary"
                        size="medium"
                        icon={<FeatherMusic />}
                        iconRight={null}
                        loading={false}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                          genAudio(stop.name, stop.id)
                        }
                      >
                        {generatingAudio ? "Generating..." : "Generate Audio"}
                      </Button>
                    </>
                  }
                  audioFileActions={
                    <>
                      <audio
                        ref={audioRef}
                        className={
                          stop.stop_audios && stop.stop_audios.url
                            ? "hidden"
                            : "hidden"
                        }
                      ></audio>
                      <Button
                        className="h-8 w-auto flex-none"
                        disabled={false}
                        variant="brand-primary"
                        size="medium"
                        icon={<FeatherPlay />}
                        iconRight={null}
                        loading={false}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                          handlePlayAudio(stop.stop_audios?.url || "")
                        }
                      >
                        Play&#39; Audio
                      </Button>
                      <Button
                        className="h-8 w-auto flex-none"
                        disabled={false}
                        variant="destructive-secondary"
                        size="medium"
                        icon={<FeatherTrash />}
                        iconRight={null}
                        loading={false}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>,
                        ) => {
                          if (
                            confirm(
                              "Are you sure you want to delete this audio? This action cannot be undone.",
                            )
                          ) {
                            deleteAudioFileAndStopAudioRecord(
                              stop.stop_audios?.url || "",
                              stop.id || "",
                              stop.stop_audios?.id || undefined,
                            );
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  }
                />
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState hasDepots={!!hasDepots} title={"Stops"} />
      )}

      <Drawer open={open}>
        <Drawer.Content>
          <CreateStopForm
            depotId={selectedDepot ? selectedDepot.id : undefined}
            initialData={editData}
            onSuccess={(stop: IStop) => {
              setOpen(false);
              refetchStops();
              setEditData(null);
              genAudio(stop.name, stop.id || "");
            }}
            onCancel={() => setOpen(false)}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
