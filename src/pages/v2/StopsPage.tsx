

import React, { useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherAlertTriangle,
  FeatherCheck,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherDownload,
  FeatherMusic,
  FeatherPin,
  FeatherPlay,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherSearch,
  FeatherTrash,
  FeatherUpload,
  FeatherVolume2,
} from "@subframe/core";
import { Drawer, Select } from "@/ui";
import { Dialog } from "@/ui/components/Dialog";
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
import { formatDate, sortByLatestCreated } from "@/utils/dateUtils";

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
  const stops = React.useMemo(() => {
    const list = (stopsData?.data as IStopWithAudio[]) || [];
    return sortByLatestCreated(list);
  }, [stopsData]);

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
  const [playingAudioUrl, setPlayingAudioUrl] = React.useState<string | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = React.useState(false);
  const [isDeletingAll, setIsDeletingAll] = React.useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = React.useState(false);
  const [genProgress, setGenProgress] = React.useState<{ current: number; total: number } | null>(null);

  const resetAudioPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setPlayingAudioUrl(null);
  };

  const handlePlayAudio = (url: string) => {
    if (!audioRef.current || !url) return;
    if (playingAudioUrl === url) {
      audioRef.current.pause();
      setPlayingAudioUrl(null);
      return;
    }
    audioRef.current.src = url;
    audioRef.current
      .play()
      .then(() => setPlayingAudioUrl(url))
      .catch((err) => {
        console.warn("Audio playback was prevented or failed:", err);
        setPlayingAudioUrl(null);
      });
  };

  // function to delete stop from supabase stops table and also delete the audio file from supabase storage and then delete stop audio record from stop_audios table if exists
  async function handleDeleteStop(stopId: string) {
    resetAudioPlayer();
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
      resetAudioPlayer();
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
    resetAudioPlayer();
    // Extract the path of the file from the URL
    const path = fileUrl.split("/").pop();
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
    resetAudioPlayer();
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
    resetAudioPlayer();
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

  const genAudio = async (text: string, stopId: string, voice: string = "meera") => {
    try {
      setGeneratingStopId(stopId);
      toast.info(`Generating audio for "${text}"...`);
      const { fileUrl, size } = await handleStopAudioGeneration(text, stopId, "en-IN", voice);
      console.log("Generated audio URL:", fileUrl, "Size:", size);
      toast.success(`Audio generated successfully for "${text}"`);
      refetchStops();
    } catch (err: any) {
      console.error("Error generating audio:", err);
      toast.error(`Audio generation failed: ${err.message || "Unknown error"}`);
    } finally {
      setGeneratingStopId(null);
    }
  };

  const handleDeleteAllStops = async () => {
    if (!selectedDepot?.id) return;
    try {
      setIsDeletingAll(true);
      resetAudioPlayer();
      const { error } = await supabase
        .from("stops")
        .update({ deleted: true })
        .eq("depot_id", selectedDepot.id)
        .eq("deleted", false);

      if (error) throw error;

      toast.success(`All stops deleted successfully for depot ${selectedDepot.name}`);
      setIsDeleteAllOpen(false);
      refetchStops();
    } catch (err: any) {
      toast.error(`Failed to delete all stops: ${err.message || err}`);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleGenerateAllAudio = async () => {
    const stopsNeedingAudio = filteredStops.filter((stop) => {
      const hasAud = Array.isArray(stop.stop_audios) ? stop.stop_audios.length > 0 : Boolean(stop.stop_audios?.url);
      return !hasAud;
    });

    const targetList = stopsNeedingAudio.length > 0 ? stopsNeedingAudio : filteredStops;
    if (targetList.length === 0) {
      toast.info("No stops available to generate audio.");
      return;
    }

    try {
      setIsGeneratingAll(true);
      setGenProgress({ current: 0, total: targetList.length });
      let successCount = 0;

      for (let i = 0; i < targetList.length; i++) {
        const s = targetList[i];
        setGenProgress({ current: i + 1, total: targetList.length });
        try {
          await handleStopAudioGeneration(s.name, s.id || "");
          successCount++;
        } catch (e) {
          console.warn(`Failed audio generation for ${s.name}:`, e);
        }
      }

      toast.success(`Generated audio for ${successCount} of ${targetList.length} stops.`);
      refetchStops();
    } catch (err: any) {
      toast.error(`Bulk generation failed: ${err.message || err}`);
    } finally {
      setIsGeneratingAll(false);
      setGenProgress(null);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    if (filteredStops.length === 0) {
      toast.info("No stops to export.");
      return;
    }
    const headers = [
      "Stop Name",
      "Kannada Name",
      "Down Latitude",
      "Down Longitude",
      "Up Latitude",
      "Up Longitude",
    ];
    const rows = filteredStops.map((s) => [
      `"${(s.name || "").replace(/"/g, '""')}"`,
      `"${((s as any).name_kn || "").replace(/"/g, '""')}"`,
      s.down_latitude ?? "",
      s.down_longitude ?? "",
      s.up_latitude ?? "",
      s.up_longitude ?? "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedDepot?.name || "depot"}_stops.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Stops exported successfully");
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDepot?.id) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        toast.error("CSV file contains no records");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const nameIndex = headers.findIndex((h) => h.includes("stop name") || h === "name");
      const nameKnIndex = headers.findIndex((h) => h.includes("kannada"));
      const downLatIndex = headers.findIndex((h) => h.includes("down latitude") || h === "down_lat");
      const downLonIndex = headers.findIndex((h) => h.includes("down longitude") || h === "down_lon");
      const upLatIndex = headers.findIndex((h) => h.includes("up latitude") || h === "up_lat");
      const upLonIndex = headers.findIndex((h) => h.includes("up longitude") || h === "up_lon");

      if (nameIndex === -1) {
        toast.error("CSV must contain a 'Stop Name' column");
        return;
      }

      const stopsToInsert: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((val) => val.replace(/^"|"$/g, "").trim()) || lines[i].split(",").map((v) => v.trim());
        const name = row[nameIndex];
        if (!name) continue;

        stopsToInsert.push({
          name: name,
          name_kn: nameKnIndex !== -1 ? row[nameKnIndex] || null : null,
          down_latitude: downLatIndex !== -1 && row[downLatIndex] ? parseFloat(row[downLatIndex]) : null,
          down_longitude: downLonIndex !== -1 && row[downLonIndex] ? parseFloat(row[downLonIndex]) : null,
          up_latitude: upLatIndex !== -1 && row[upLatIndex] ? parseFloat(row[upLatIndex]) : null,
          up_longitude: upLonIndex !== -1 && row[upLonIndex] ? parseFloat(row[upLonIndex]) : null,
          depot_id: selectedDepot.id,
          organization_id: selectedOrganization?.id,
          deleted: false,
        });
      }

      if (stopsToInsert.length === 0) {
        toast.error("No valid stops found in CSV");
        return;
      }

      const { error } = await supabase.from("stops").insert(stopsToInsert);
      if (error) throw error;

      toast.success(`Imported ${stopsToInsert.length} stops successfully`);
      refetchStops();
    } catch (err: any) {
      console.error("Import failed:", err);
      toast.error(`CSV import failed: ${err.message || err}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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

            <div className="flex flex-wrap items-end gap-2 w-full sm:w-auto">
              {/* Hidden file input for CSV Import */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleImportCSV}
              />

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

              <Button
                variant="neutral-secondary"
                className="h-9 flex-1 sm:flex-none"
                icon={<FeatherMusic className="h-3.5 w-3.5" />}
                loading={isGeneratingAll}
                disabled={isGeneratingAll || filteredStops.length === 0}
                onClick={handleGenerateAllAudio}
              >
                {isGeneratingAll && genProgress
                  ? `Generating (${genProgress.current}/${genProgress.total})...`
                  : "Generate All Audio"}
              </Button>

              <Button
                variant="neutral-secondary"
                className="h-9 flex-1 sm:flex-none"
                icon={<FeatherDownload className="h-3.5 w-3.5" />}
                disabled={filteredStops.length === 0}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>

              <RBAC
                features={["PAS", "ITMS"]}
                roles={[
                  "region_admin",
                  "organization_admin",
                  "master",
                  "depot_admin",
                ]}
              >
                <Button
                  variant="neutral-secondary"
                  className="h-9 flex-1 sm:flex-none"
                  icon={<FeatherUpload className="h-3.5 w-3.5" />}
                  disabled={!selectedDepot}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import CSV
                </Button>
              </RBAC>

              <RBAC
                features={["PAS", "ITMS"]}
                roles={[
                  "region_admin",
                  "organization_admin",
                  "master",
                  "depot_admin",
                ]}
              >
                <Button
                  variant="destructive-secondary"
                  className="h-9 flex-1 sm:flex-none"
                  icon={<FeatherTrash className="h-3.5 w-3.5" />}
                  disabled={!selectedDepot || filteredStops.length === 0}
                  onClick={() => setIsDeleteAllOpen(true)}
                >
                  Delete All Stops
                </Button>
              </RBAC>

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
                  onClick={() => {
                    setEditData(null);
                    setOpen(true);
                  }}
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

      {/* Delete All Confirmation Dialog */}
      <Dialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <Dialog.Content className="w-full max-w-md flex-none p-6">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3 text-red-600">
              <FeatherAlertTriangle className="h-6 w-6 flex-none" />
              <span className="text-heading-3 font-heading-3">Delete All Stops</span>
            </div>
            <span className="text-body font-body text-neutral-600">
              Are you sure you want to delete all <strong>{filteredStops.length}</strong> stops for depot{" "}
              <strong>{selectedDepot?.name || "selected"}</strong>? This action cannot be undone.
            </span>
            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-border">
              <Button
                variant="neutral-secondary"
                disabled={isDeletingAll}
                onClick={() => setIsDeleteAllOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive-primary"
                loading={isDeletingAll}
                onClick={handleDeleteAllStops}
              >
                Delete All Stops
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>

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
                  <Table.HeaderCell className="hidden xl:table-cell min-w-[130px]">Created At</Table.HeaderCell>
                  <Table.HeaderCell className="w-12 justify-end" />
                </Table.HeaderRow>
              }
            >
              {paginatedStops.map((stop, index) => {
                const serialNumber = (currentPage - 1) * pageSize + index + 1;
                const firstAudio = Array.isArray(stop.stop_audios)
                  ? stop.stop_audios[0]
                  : stop.stop_audios;
                const hasAudio = Boolean(firstAudio?.url);
                const audioUrl = firstAudio?.url || "";
                const audioId = firstAudio?.id;

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
                            variant={playingAudioUrl === audioUrl ? "brand-primary" : "brand-secondary"}
                            icon={
                              playingAudioUrl === audioUrl ? (
                                <FeatherVolume2 className="h-3 w-3 animate-pulse" />
                              ) : (
                                <FeatherPlay className="h-3 w-3" />
                              )
                            }
                            onClick={() => handlePlayAudio(audioUrl)}
                          >
                            {playingAudioUrl === audioUrl ? "Playing" : "Play"}
                          </Button>
                          <Badge variant="success" icon={<FeatherCheck className="h-3 w-3" />}>Audio Ready</Badge>
                          <IconButton
                            size="small"
                            variant="destructive-tertiary"
                            icon={<FeatherTrash className="h-3.5 w-3.5" />}
                            title="Delete Audio"
                            aria-label="Delete Audio"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this audio? This action cannot be undone.",
                                )
                              ) {
                                deleteAudioFileAndStopAudioRecord(
                                  audioUrl,
                                  stop.id || "",
                                  audioId || undefined,
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
                    <Table.Cell className="hidden xl:table-cell min-w-[130px]">
                      <span className="whitespace-nowrap text-body font-body text-neutral-500">
                        {formatDate(stop.created_at)}
                      </span>
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
                            if (audioUrl) {
                              deleteAudioFileAndStopAudioRecordAndStop(
                                audioUrl,
                                stop.id || "",
                                audioId || undefined,
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
            onSuccess={async (stop: IStop, nameChanged?: boolean, voice?: string) => {
              setOpen(false);
              const wasEdit = !!editData;
              const prevData = editData;
              setEditData(null);
              refetchStops();

              if (!wasEdit) {
                // New stop created - automatically generate audio (BUG-027)
                await genAudio(stop.name, stop.id || "", voice);
              } else if (nameChanged) {
                // Stop name was updated - regenerate audio to match new name (BUG-029)
                const firstAudio = Array.isArray(prevData?.stop_audios)
                  ? prevData?.stop_audios[0]
                  : prevData?.stop_audios;
                if (firstAudio?.url) {
                  await deleteAudioFileAndStopAudioRecord(
                    firstAudio.url,
                    stop.id || "",
                    firstAudio.id,
                  );
                }
                await genAudio(stop.name, stop.id || "", voice);
              }
            }}
            onCancel={() => {
              setOpen(false);
              setEditData(null);
            }}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
