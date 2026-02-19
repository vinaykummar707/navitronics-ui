"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { OrganizationCard } from "@/ui/components/OrganizationCard";
import { OrganizationList } from "@/ui/components/OrganizationList";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherMusic,
  FeatherPin,
  FeatherPlay,
  FeatherPlus,
  FeatherTrash,
} from "@subframe/core";
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "@/services/organizationService";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { Drawer } from "@/ui/components/Drawer";
import { CreateOrganizationDrawer, Select } from "@/ui";
import { useOrganizations } from "@/api/organization/hooks";
import { Organization } from "@/api/organization/types";
import { ButtonGroup } from "@/ui/components/ButtonGroup";
import RBAC from "@/components/RBAC";
import { CreateStopForm } from "@/ui/components/CreateStopForm";
import { useStops } from "@/api/stop/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegions } from "@/api/region/hooks";
import useAuthStore from "@/store/authStore";
import { useDepots } from "@/api/depot/hooks";
import { de } from "zod/v4/locales";
import { StopDetailsCard } from "@/ui/components/StopDetailsCard";
import { AudioFileContainer } from "@/ui/components/AudioFileContainer";
import { supabase } from "@/supabaseClient";
import { handleStopAudioGeneration } from "@/utils/fetchTTS";
import { Stop } from "@/api/stop/types";

function StopsPage() {
  // Queries
  const { selectedOrganization } = useOrganizationStore();

  const [editData, setEditData] = React.useState<Stop | null>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(
    null,
  );
  const { data: regionData, refetch: regionRefetch } = useRegions({
    variables: {
      organization_id: selectedOrganization ? selectedOrganization.id : "",
    },
  });
  const regions = regionData?.regions || [];
  const user = useAuthStore((state) => state.user); // Get user details

  const [selectedDepot, setSelectedDepot] = React.useState<string | null>(null);
  const { data: depotData, refetch: depotRefetch } = useDepots({
    variables: {
      organization_id: selectedOrganization ? selectedOrganization.id : "",
      region_id: selectedRegion,
    },
  });
  const depots = depotData?.depots || [];

  const {
    data,
    loading,
    error,
    refetch: stopsRefetch,
  } = useStops({
    variables: {
      organization_id: selectedOrganization?.id,
      depot_id: selectedDepot,
    },
  });
  const stops = data ? data.stops : [];

  // bydefault select first region
  React.useEffect(() => {
    console.log("Regions loaded:", regions);
    if (regions.length > 0) {
      if (
        user.userRole === "master" ||
        user.userRole === "organization_admin"
      ) {
        setSelectedRegion(regions[0].id);
      }
      if (user.userRole === "region_admin" || user.userRole === "depot_admin") {
        const userRegion = regions.find(
          (region) => region.id === user?.area.areaId,
        );
        setSelectedRegion(userRegion ? userRegion.id : regions[0].id);
      }
    }
  }, [regions]);

  // by default select first depot
  React.useEffect(() => {
    if (depots.length > 0) {
      if (
        user.userRole === "master" ||
        user.userRole === "organization_admin"
      ) {
        setSelectedDepot(depots[0].id);
      }
      if (user.userRole === "region_admin" || user.userRole === "depot_admin") {
        const userDepot = depots.find(
          (depot) => depot.id === user?.area.areaId,
        );
        setSelectedDepot(userDepot ? userDepot.id : depots[0].id);
      }
    }
  }, [depots]);

  //refetch regions when selectedOrganization changes
  React.useEffect(() => {
    if (selectedOrganization) {
      regionRefetch();
    }
  }, [selectedOrganization]);

  // depotRefetch when selectedRegion changes
  React.useEffect(() => {
    if (selectedRegion) {
      depotRefetch();
    }
  }, [selectedRegion]);

  // stopsRefetch when selectedDepot changes
  React.useEffect(() => {
    if (selectedDepot) {
      stopsRefetch();
    }
  }, [selectedDepot]);

  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handlePlayAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
    }
  };

  // function to delete stop from supabase stops table and also delete the audio file from supabase storage and then delete stop audio record from stop_audios table if exists
  async function deleteStop(stopId: string) {
    try {
      // First, delete the stop record from the stops table
      const { data, error } = await supabase
        .from("stops")
        .delete()
        .match({ id: stopId });
      if (error) {
        throw new Error(`Failed to delete stop: ${error.message}`);
      }
      console.log("Stop deleted successfully:", data);
      stopsRefetch(); // Refresh the stops data to reflect the deletion
    } catch (err) {
      console.error("Delete operation failed:", err);
    }
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
      stopsRefetch(); // Refresh the stops data to reflect the deletion
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
    if (stop_audio_id) {
      await deleteStopAudio(stop_audio_id);
      await deleteStop(stopId);
    }
  }

  const genAudio = async (text: string, stopId: string) => {
    try {
      const { fileUrl, size } = await handleStopAudioGeneration(text, stopId);
      console.log("Generated audio URL:", fileUrl, "Size:", size);
      stopsRefetch(); // Refresh the stops data to reflect the new audio
    } catch (err) {
      console.error("Error generating audio:", err);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-6 px-12 py-12">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Stops
        </span>
        <span className="text-body font-body text-subtext-color">
          Stops overview and management
        </span>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="text-caption font-caption text-subtext-color">
          Showing {stops.length ?? 0} records
        </span>
        <div className="flex gap-2">
          <RBAC features={[]} roles={["depot_admin", "region_admin"]}>
            <Select
              className="h-auto  flex-none"
              variant="outline"
              label=""
              placeholder="Select Region"
              value={selectedRegion || ""}
              onValueChange={(val) => setSelectedRegion(val)}
            >
              {regions
                .filter((region) => user?.area.areaId === region.id)
                .map((region) => (
                  <Select.Item key={region.id} value={region.id}>
                    {region.name}
                  </Select.Item>
                ))}
            </Select>
          </RBAC>

          <RBAC features={[]} roles={["master", "organization_admin"]}>
            <Select
              className="h-auto  flex-none"
              variant="outline"
              label=""
              placeholder="Select Region"
              value={selectedRegion || ""}
              onValueChange={(val) => setSelectedRegion(val)}
            >
              {regions.map((region) => (
                <Select.Item key={region.id} value={region.id}>
                  {region.name}
                </Select.Item>
              ))}
            </Select>
          </RBAC>

          <RBAC features={[]} roles={["master", "organization_admin"]}>
            <Select
              className="h-auto  flex-none"
              variant="outline"
              label=""
              placeholder="Select Depot"
              value={selectedDepot || ""}
              onValueChange={(val) => setSelectedDepot(val)}
            >
              {depots.map((depot) => (
                <Select.Item key={depot.id} value={depot.id}>
                  {depot.name}
                </Select.Item>
              ))}
            </Select>
          </RBAC>

          <RBAC
            features={[]}
            roles={["region_admin", "organization_admin", "master"]}
          >
            <Button
              variant=""
              icon={<FeatherPlus />}
              disabled={!selectedDepot}
              onClick={() => {
                setOpen(true);
                setEditData(null);
              }}
            >
              Add Stop
            </Button>
          </RBAC>
        </div>
      </div>

      {stops && stops.length > 0 ? (
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
                if (stop.stop_audios && stop.stop_audios.url) {
                  deleteAudioFileAndStopAudioRecordAndStop(
                    stop.stop_audios.url,
                    stop.id || "",
                    stop.stop_audios.id || undefined,
                  );
                } else {
                  deleteStop(stop.id || "");
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
                      ? `${(stop.stop_audios.file_size / 1024 / 1024).toFixed(2)} MB`
                      : "No Audio File Found"
                  }
                  isAudioAvailable={
                    stop.stop_audios && stop.stop_audios.url ? true : false
                  }
                  actions={
                    <>
                      <Button
                        className="h-8 w-auto flex-none"
                        disabled={false}
                        variant="brand-primary"
                        size="medium"
                        icon={<FeatherMusic />}
                        iconRight={null}
                        loading={false}
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                          genAudio(stop.name, stop.id)
                        }
                      >
                        Generate Audio
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
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                          deleteAudioFileAndStopAudioRecord(
                            stop.stop_audios?.url || "",
                            stop.id || "",
                            stop.stop_audios?.id || undefined,
                          )
                        }
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
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Stops Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any stops added yet. Start by adding a new stop.
            </p>
          </div>
        </div>
      )}

      <Drawer open={open}>
        <Drawer.Content>
          <CreateStopForm
            depotId={selectedDepot}
            initialData={editData}
            onSuccess={() => {
              setOpen(false);
              stopsRefetch();
            }}
            onCancel={() => setOpen(false)}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}

export default StopsPage;
