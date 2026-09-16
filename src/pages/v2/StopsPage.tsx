

import React, { useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherCheck,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherMusic,
  FeatherPin,
  FeatherPlay,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherSearch,
  FeatherTrash,
} from "@subframe/core";
import { Drawer, Select } from "@/ui";
import { TextField } from "@/ui/components/TextField";
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
import { Table } from "@/ui/components/Table";
import { Badge } from "@/ui/components/Badge";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { IconButton } from "@/ui/components/IconButton";
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
    skip: !selectedOrganization?.id,
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
      organization_id: selectedOrganization?.id || "",
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
    skip: !selectedDepot?.id || !selectedOrganization?.id,
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

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 24;

  const filteredStops = React.useMemo(() => {
    if (!stops) return [];
    if (!searchTerm.trim()) return stops;
    const term = searchTerm.toLowerCase();
    return stops.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) ||
        (s as any).name_kn?.toLowerCase().includes(term)
    );
  }, [stops, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredStops.length / pageSize));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepot]);

  const paginatedStops = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStops.slice(start, start + pageSize);
  }, [filteredStops, currentPage, pageSize]);

  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handlePlayAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback was prevented or failed:", err);
      });
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
          `Error deleting stop: ${error.message || "Unknown error"}`,
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
    if (fileUrl) await deleteAudioFile(fileUrl, stopId);
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
    if (fileUrl) await deleteAudioFile(fileUrl, stopId);
    if (stop_audio_id) await deleteStopAudio(stop_audio_id);
    deleteStop(stopId, {
      onSuccess: () => {
        toast.success("Stop deleted successfully");
        refetchStops();
      },
      onError: (error) => {
        toast.error(`Error deleting stop: ${error.message || "Unknown error"}`);
      },
    });
  }

  const [generatingStopId, setGeneratingStopId] = React.useState<string | null>(null);

  const genAudio = async (text: string, stopId: string) => {
    try {
      setGeneratingStopId(stopId);
      toast.info(`Generating audio for "${text}"...`);
      const { fileUrl, size } = await handleStopAudioGeneration(text, stopId);
      console.log("Generated audio URL:", fileUrl, "Size:", size);
      toast.success(`Audio generated successfully for "${text}"`);
      refetchStops(); // Refresh the stops data to reflect the new audio
    } catch (err: any) {
      console.error("Error generating audio:", err);
      toast.error(`Audio generation failed: ${err.message || "Unknown error"}`);
    } finally {
      setGeneratingStopId(null);
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
          Manage Stops and Public Address Audio for your Depot
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex w-full flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <span className="text-caption font-caption text-subtext-color whitespace-nowrap">
            Showing {filteredStops.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
            {Math.min(currentPage * pageSize, filteredStops.length)} of {filteredStops.length} records
          </span>
          <TextField
            className="h-9 w-full sm:w-64 flex-none"
            variant="filled"
            icon={<FeatherSearch />}
            helpText=""
          >
            <TextField.Input
              placeholder="Search stops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </TextField>
        </div>

        {hasRegions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full lg:w-auto">
            <div className="flex items-end gap-2 flex-1 sm:flex-none">
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
                <RBAC features={[]} roles={["master", "organization_admin", "region_admin"]}>
                  <Select
                    className="h-auto flex-none"
                    variant="filled"
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
            </div>

            <div className="flex items-end gap-2 w-full sm:w-auto">
              <Button
                variant="neutral-primary"
                className="h-9 flex-1 sm:flex-none"
                icon={<FeatherRefreshCw />}
                onClick={() => {
                  toast.success("Stops refreshed successfully");
                  refetchStops();
                }}
              >
                Refresh
              </Button>

              <RBAC
                features={["PAS", "ITMS"]}
                roles={[
                  "region_admin",
                  "organization_admin",
                  "master",
                  "depot_admin",
                  "user",
                ]}
              >
                <Button
                  className="h-9 flex-1 sm:flex-none"
                  icon={<FeatherPlus />}
                  disabled={!selectedDepot}
                  onClick={() => setOpen(true)}
                >
                  Add Stop
                </Button>
              </RBAC>
            </div>
          </div>
        )}
      </div>

      {/* Shared audio player instance */}
      <audio ref={audioRef} className="hidden" />

      {/* Content */}
      {hasStops ? (
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col items-start overflow-x-auto touch-scroll-x rounded-md border border-solid border-neutral-border bg-sidebar-background shadow-xs">
            <Table
              header={
                <Table.HeaderRow>
                  <Table.HeaderCell className="w-16">#</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[160px]">Stop Name</Table.HeaderCell>
                  <Table.HeaderCell className="hidden md:table-cell min-w-[160px]">Downward (Lat, Long)</Table.HeaderCell>
                  <Table.HeaderCell className="hidden lg:table-cell min-w-[160px]">Upward (Lat, Long)</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[180px] justify-center text-center">Audio Announcement</Table.HeaderCell>
                  <Table.HeaderCell className="w-12 justify-end" />
                </Table.HeaderRow>
              }
            >
              {paginatedStops.map((stop, index) => {
                const serialNumber = (currentPage - 1) * pageSize + index + 1;
                const hasAudio = !!(stop.stop_audios && stop.stop_audios.url);

                return (
                  <Table.Row key={stop.id}>
                    <Table.Cell>
                      <span className="text-caption-bold font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-primary border border-brand-primary/30">
                        #{serialNumber}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                          {stop.name}
                        </span>
                        {(stop as any).name_kn ? (
                          <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                            {(stop as any).name_kn}
                          </span>
                        ) : null}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="hidden md:table-cell">
                      <span className="whitespace-nowrap text-caption font-mono text-default-font">
                        {stop.down_latitude != null && stop.down_longitude != null
                          ? `${stop.down_latitude}, ${stop.down_longitude}`
                          : "—"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="hidden lg:table-cell">
                      <span className="whitespace-nowrap text-caption font-mono text-default-font">
                        {stop.up_latitude != null && stop.up_longitude != null
                          ? `${stop.up_latitude}, ${stop.up_longitude}`
                          : "—"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="min-w-[180px] justify-center text-center">
                      {hasAudio ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="small"
                            variant="brand-secondary"
                            icon={<FeatherPlay className="h-3 w-3" />}
                            onClick={() => handlePlayAudio(stop.stop_audios?.url || "")}
                          >
                            Play
                          </Button>
                          <Badge variant="success" icon={<FeatherCheck className="h-3 w-3" />}>Audio Ready</Badge>
                          <IconButton
                            size="small"
                            variant="destructive-tertiary"
                            icon={<FeatherTrash className="h-3.5 w-3.5" />}
                            onClick={() => {
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
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="small"
                            variant="neutral-secondary"
                            icon={<FeatherMusic className="h-3 w-3" />}
                            loading={generatingStopId === stop.id}
                            disabled={generatingStopId !== null}
                            onClick={() => genAudio(stop.name, stop.id || "")}
                          >
                            {generatingStopId === stop.id ? "Generating..." : "Generate Audio"}
                          </Button>
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell className="justify-end">
                      <OptionsDropdown
                        onEdit={() => {
                          setOpen(true);
                          setEditData(stop);
                        }}
                        onDelete={() => {
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
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex w-full items-center justify-between border-t border-neutral-border pt-4 mt-2">
              <Button
                variant="neutral-secondary"
                size="small"
                icon={<FeatherChevronLeft />}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-caption font-caption text-neutral-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="neutral-secondary"
                size="small"
                iconRight={<FeatherChevronRight />}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
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
