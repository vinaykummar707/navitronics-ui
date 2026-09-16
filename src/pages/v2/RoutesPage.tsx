import React, { useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherAlertTriangle,
  FeatherDownload,
  FeatherPanelLeft,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherTrash,
  FeatherX,
} from "@subframe/core";
import { IconButton, Select } from "@/ui";
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
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AVAILABLE_LANGUAGES } from "@/constants/defaultRouteValues";
import axios from "axios";
import { convertV2ToV1 } from "@/utils/routeConfigMapper";
import { Dialog } from "@/ui/components/Dialog";
import { getUserRouteAccess } from "@/utils/featureFlags";
import { pickTargetDirectory, writeZipToDirectoryOrFallback } from "@/utils/fileSystemExport";


// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Sub-components ──────────────────────────────
function useRoutesPageData() {
  const { selectedOrganization } = useOrganizationStore();
  const selectedRegion = useRegionStore(
    (state) => state.routesPageRegion ?? state.selectedRegion,
  );
  const setRoutesPageRegion = useRegionStore(
    (state) => state.setRoutesPageRegion,
  );
  const selectedDepot = useDepotStore(
    (state) => state.routesPageDepot ?? state.selectedDepot,
  );
  const setRoutesPageDepot = useDepotStore(
    (state) => state.setRoutesPageDepot,
  );
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

  const { data: routesData, refetch: refetchRoutes } = routeCrud.useList({
    filters: {
      depot_id: selectedDepot?.id || "",
      deleted: false,
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      return query.select(`*, created_by_user:created_by (email)`);
    },
    skip: !selectedDepot?.id || !selectedOrganization?.id,
  });

  const regions = regionData?.data as IRegion[];
  const depots = depotData?.data as IDepot[];
  const routes = routesData?.data as IRoute[];

  // Auto-select or validate region:
  // If regions are still loading, do not touch selection
  useEffect(() => {
    if (!regions) return;

    if (regions.length === 0) {
      if (selectedRegion) {
        setRoutesPageRegion(null);
      }
      return;
    }

    const isSelectedRegionValid = regions.some(
      (region) => region.id === selectedRegion?.id,
    );

    if (!isSelectedRegionValid) {
      setRoutesPageRegion(regions[0]);
    }
  }, [regions, selectedRegion, setRoutesPageRegion]);

  // Auto-select or validate depot:
  // If depots are still loading, do not touch selection
  useEffect(() => {
    if (!depots) return;

    if (depots.length === 0) {
      if (selectedDepot) {
        setRoutesPageDepot(null);
      }
      return;
    }

    const isSelectedDepotValid = depots.some(
      (depot) => depot.id === selectedDepot?.id,
    );

    if (!isSelectedDepotValid) {
      setRoutesPageDepot(depots[0]);
    }
  }, [depots, selectedDepot, setRoutesPageDepot]);

  return {
    user,
    regions,
    depots,
    routes,
    selectedRegion,
    selectedDepot,
    selectedOrganization,
    setRoutesPageRegion,
    setRoutesPageDepot,
    refetchRoutes,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoutesPage() {
  const navigate = useNavigate();
  const {
    user,
    regions,
    depots,
    routes,
    selectedRegion,
    selectedDepot,
    selectedOrganization,
    setRoutesPageRegion,
    setRoutesPageDepot,
    refetchRoutes,
  } = useRoutesPageData();

  const routeAccess = getUserRouteAccess(user);

  const { mutate: deleteRoute } = routeCrud.useDelete();
  const { mutate: deleteSelectedRoutes } = routeCrud.useDeleteAll();
  const { mutate: createRoute } = routeCrud.useCreate();

  const handleRegionChange = (val: string) => {
    const nextRegion = regions?.find((r) => r.id === val) || null;
    setRoutesPageRegion(nextRegion);
  };

  const handleDepotChange = (val: string) => {
    const nextDepot = depots?.find((d) => d.id === val) || null;
    setRoutesPageDepot(nextDepot);
  };

  const handleEditRoute = (routeId: string) => {
    const route = routes?.find((r) => r.id === routeId);
    const isV1 = route?.version === "1.0";

    if (isV1) {
      if (!routeAccess.hasV1Routes) {
        toast.error("You do not have permission to edit V1 routes");
        return;
      }
      navigate(
        `/routes/create-v1/${selectedOrganization?.id}/${selectedDepot?.id}/${routeId}`,
      );
    } else {
      if (!routeAccess.hasV2Routes) {
        toast.error("You do not have permission to edit V2 routes");
        return;
      }
      navigate(
        `/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}/${routeId}`,
      );
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute(routeId, {
      onSuccess: () => {
        toast.success("Route deleted successfully");
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(
          `Error deleting route: ${error.message || "Unknown error"}`,
        );
      },
    });
  };

  const handleReturn = async (routeId: string, routeNumberSuffix: string) => {
    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      toast.error("Error fetching return Route");
      return;
    }

    const { id, ...routeWithoutId } = originalRoute;

    let reversedStops = originalRoute.stops;
    if (originalRoute.stops) {
      try {
        const parsed =
          typeof originalRoute.stops === "string"
            ? JSON.parse(originalRoute.stops)
            : originalRoute.stops;
        if (Array.isArray(parsed)) {
          reversedStops = JSON.stringify([...parsed].reverse());
        }
      } catch (err) {
        console.error("Error reversing stops for return route:", err);
      }
    }

    createRoute(
      {
        ...routeWithoutId,
        source: originalRoute.destination || originalRoute.source,
        destination: originalRoute.source || originalRoute.destination,
        stops: reversedStops,
        route_number: `${originalRoute.route_number}${routeNumberSuffix}`,
        created_at: new Date().toISOString(),
        return: true,
        created_by: user?.id || "",
      },
      {
        onSuccess: () => {
          toast.success("Return Route Created successfully");
          refetchRoutes();
        },
        onError: (error) => {
          toast.error(
            `Error creating return route: ${error.message || "Unknown error"}`,
          );
        },
      },
    );
  };

  const duplicateRoute = async (routeId: string, routeNumberSuffix: string) => {
    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      toast.error("Error fetching route to duplicate");
      return;
    }

    const { id, ...routeWithoutId } = originalRoute;
    createRoute(
      {
        ...routeWithoutId,
        route_number: `${originalRoute.route_number}${routeNumberSuffix}`,
        created_at: new Date().toISOString(),
        created_by: user?.id || "",
      },
      {
        onSuccess: () => {
          toast.success("Route duplicated successfully");
          refetchRoutes();
        },
        onError: (error) => {
          toast.error(
            `Error duplicating route: ${error.message || "Unknown error"}`,
          );
        },
      },
    );
  };

  const [versionFilter, setVersionFilter] = React.useState<"all" | "v1" | "v2">("all");

  const filteredRoutes = React.useMemo(() => {
    if (!routes) return [];
    if (routeAccess.isV1Only) {
      return routes.filter((r) => r.version === "1.0");
    }
    if (routeAccess.isV2Only) {
      return routes.filter((r) => r.version !== "1.0");
    }
    // Dual user or master
    if (versionFilter === "v1") {
      return routes.filter((r) => r.version === "1.0");
    }
    if (versionFilter === "v2") {
      return routes.filter((r) => r.version !== "1.0");
    }
    return routes;
  }, [routes, routeAccess.isV1Only, routeAccess.isV2Only, versionFilter]);

  const hasRegions = regions && regions.length > 0;
  const hasDepots = depots && depots.length > 0;
  const hasRoutes = filteredRoutes && filteredRoutes.length > 0;

  const [selectedRouteIds, setSelectedRouteIds] = React.useState<string[]>([]);

  const selectedRouteIdsSet = React.useMemo(
    () => new Set(selectedRouteIds),
    [selectedRouteIds]
  );

  const selectedRouteObjects = React.useMemo(() => {
    if (!filteredRoutes || selectedRouteIds.length === 0) return [];
    return filteredRoutes.filter((route) => selectedRouteIdsSet.has(route.id));
  }, [filteredRoutes, selectedRouteIdsSet]);

  const handleSelectedChange = (routeId: string, selected: boolean) => {
    setSelectedRouteIds((prev) => {
      if (selected) {
        return prev.includes(routeId) ? prev : [...prev, routeId];
      } else {
        return prev.filter((id) => id !== routeId);
      }
    });
  };

  const handleSelectAllChange = (selected: boolean) => {
    if (selected && filteredRoutes) {
      setSelectedRouteIds(filteredRoutes.map((r) => r.id));
    } else {
      setSelectedRouteIds([]);
    }
  };

  const handleDeleteSelectedRoutes = () => {
    deleteSelectedRoutes(selectedRouteIds, {
      onSuccess: () => {
        toast.success("Selected routes deleted successfully");
        setSelectedRouteIds([]);
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(
          `Error deleting selected routes: ${error.message || "Unknown error"}`,
        );
      },
    });
  };

  //function to parse a field value with key in a json
  const parseFieldValue = (
    fieldValue: any,
    fieldKey: string,
    json: IRoute,
  ) => {
    const value = fieldValue !== undefined && fieldValue !== null ? fieldValue : json[fieldKey];
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "object") {
      return value;
    }
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (err) {
        console.warn(`Failed to parse ${fieldKey} as JSON:`, err);
        return value;
      }
    }
    return value;
  };

  type FileItem = {
  name: string;
  url: string;
};

   const downloadZip = async (
  files: FileItem[],
  zipName: string
) => {
  const zip = new JSZip();

  await Promise.all(
    files.map(async (file) => {
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    })
  );

  const content = await zip.generateAsync({ type: "blob" });

  saveAs(content, `${zipName}.zip`);
};

  const [isMixedVersionDialogOpen, setIsMixedVersionDialogOpen] = React.useState(false);

  const handleExportSelectedRoutes = () => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }

    const hasV1Routes = selectedRouteObjects.some((r) => r.version === "1.0");
    const hasV2Routes = selectedRouteObjects.some((r) => r.version !== "1.0");

    if (hasV1Routes && hasV2Routes) {
      setIsMixedVersionDialogOpen(true);
      return;
    }

    if (hasV1Routes) {
      executeExport("v1");
      return;
    }

    executeExport("v2");
  };

  const executeExport = async (format: "v1" | "v2") => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }

    // 1. Prompt for target directory upfront while user gesture is active
    const { handle: dirHandle, cancelled } = await pickTargetDirectory();
    if (cancelled) {
      toast.info("Export cancelled");
      return;
    }

    const rawRoutesToExport = selectedRouteObjects.map((route) => ({
      ...route,
      front: parseFieldValue(route.front as string | null, "front", route),
      side: parseFieldValue(route.side as string | null, "side", route),
      rear: parseFieldValue(route.rear as string | null, "rear", route),
      internal: parseFieldValue(
        route.internal as string | null,
        "internal",
        route,
      ),
      stops: parseFieldValue(route.stops as string | null, "stops", route),
    }));

    const currentDate = new Date().toISOString().split("T")[0];

    if (format === "v1") {
      const v1RoutesPayload = rawRoutesToExport.map((route) => convertV2ToV1(route));
      toast.info("Requesting V1 export package...");

      const apiBase =
        import.meta.env.VITE_CONTROLLER_API_URL ||
        "https://api.navitronix.in/navitranix/api";

      try {
        const areaId = selectedOrganization?.id || "";
        const depotId = selectedDepot?.id || "";
        const exportUrl = `${apiBase}/routes/export?areaId=${areaId}&depotId=${depotId}`;

        const response = await axios.post(exportUrl, v1RoutesPayload, {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        const result = await writeZipToDirectoryOrFallback(
          blob,
          dirHandle,
          `routes_export_v1_${currentDate}.zip`,
          "Navitronix_Routes"
        );

        if (result.savedAsFolder) {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) to Navitronix_Routes folder (V1)`);
        } else {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) in V1 format (.zip)`);
        }
      } catch (error: any) {
        console.error("V1 Export API Error:", error);
        toast.error(`V1 Export failed: ${error?.response?.data?.message || error.message || "Server error"}`);
      }
    } else {
      // V2 Format API Export
      toast.info("Requesting V2 export package...");

      const apiBase =
        import.meta.env.VITE_CONTROLLER_API_URL ||
        "https://api.navitronix.in/navitranix/api";

      try {
        const areaId = selectedOrganization?.id || "";
        const depotId = selectedDepot?.id || "";
        const exportUrl = `${apiBase}/routes/export-v2?areaId=${areaId}&depotId=${depotId}`;

        const response = await axios.post(exportUrl, rawRoutesToExport, {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        const result = await writeZipToDirectoryOrFallback(
          blob,
          dirHandle,
          `routes_export_v2_${currentDate}.zip`,
          "Navitronix_Routes"
        );

        if (result.savedAsFolder) {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) to Navitronix_Routes folder (V2)`);
        } else {
          toast.success(`Exported ${selectedRouteObjects.length} route(s) in V2 format (.zip)`);
        }
      } catch (error: any) {
        console.error("V2 Export API Error:", error);
        toast.error(`V2 Export failed: ${error?.response?.data?.message || error.message || "Server error"}`);
      }
    }
  };



  return (
    <div className="flex h-full overflow-hidden w-full flex-col items-start gap-4 ">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Routes
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage routes for your Depot
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex w-full flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-caption font-caption text-subtext-color">
            Showing {filteredRoutes.length} of {routes?.length || 0} records
          </span>
          {routeAccess.isDualUser && routes && routes.length > 0 && (
            <div className="flex items-center rounded-md border border-neutral-border bg-neutral-100 p-0.5 text-xs flex-wrap">
              <button
                type="button"
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  versionFilter === "all"
                    ? "bg-brand-50 text-brand-primary border border-brand-primary/40 shadow-sm"
                    : "text-subtext-color hover:text-default-font"
                }`}
                onClick={() => setVersionFilter("all")}
              >
                All ({routes.length})
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  versionFilter === "v1"
                    ? "bg-brand-50 text-brand-primary border border-brand-primary/40 shadow-sm"
                    : "text-subtext-color hover:text-default-font"
                }`}
                onClick={() => setVersionFilter("v1")}
              >
                V1 ({routes.filter((r) => r.version === "1.0").length})
              </button>
              <button
                type="button"
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  versionFilter === "v2"
                    ? "bg-brand-50 text-brand-primary border border-brand-primary/40 shadow-sm"
                    : "text-subtext-color hover:text-default-font"
                }`}
                onClick={() => setVersionFilter("v2")}
              >
                V2 ({routes.filter((r) => r.version !== "1.0").length})
              </button>
            </div>
          )}
        </div>

        {hasRegions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
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
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <Button
                variant="neutral-secondary"
                className="h-9 sm:h-8 flex-1 sm:flex-none"
                icon={<FeatherRefreshCw />}
                onClick={() => {
                  toast.success("Routes refreshed successfully");
                  refetchRoutes();
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
                {routeAccess.hasV1Routes && (
                  <Button
                    icon={<FeatherPlus />}
                    variant="brand-secondary-2"
                    className="h-9 sm:h-8 flex-1 sm:flex-none"
                    disabled={!selectedDepot}
                    onClick={() =>
                      navigate(
                        `/routes/create-v1/${selectedOrganization?.id}/${selectedDepot?.id}`,
                      )
                    }
                  >
                    {routeAccess.isV1Only ? "Add Route" : "V1 Add Route"}
                  </Button>
                )}
                {routeAccess.hasV2Routes && (
                  <Button
                    icon={<FeatherPlus />}
                    className="h-9 sm:h-8 flex-1 sm:flex-none"
                    disabled={!selectedDepot}
                    onClick={() =>
                      navigate(
                        `/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}`,
                      )
                    }
                  >
                    {routeAccess.isV2Only ? "Add Route" : "V2 Add Route"}
                  </Button>
                )}
              </RBAC>
              {selectedRouteIds.length > 0 && (
                <>
                  <Button
                    icon={<FeatherDownload />}
                    variant="brand-secondary-2"
                    className="h-9 sm:h-8 flex-1 sm:flex-none"
                    disabled={!selectedDepot || selectedRouteIds.length === 0}
                    onClick={handleExportSelectedRoutes}
                  >
                    Export ({selectedRouteIds.length})
                  </Button>
                  <Button
                    icon={<FeatherTrash />}
                    variant="destructive-secondary"
                    className="h-9 sm:h-8 flex-1 sm:flex-none"
                    disabled={!selectedDepot || selectedRouteIds.length === 0}
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${selectedRouteIds.length} selected route(s)?`,
                        )
                      ) {
                        handleDeleteSelectedRoutes();
                      }
                    }}
                  >
                    Delete ({selectedRouteIds.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {hasRoutes ? (
        <RouteTable
          routes={filteredRoutes}
          onEdit={handleEditRoute}
          onDelete={(routeId: string) => {
            if (
              confirm(
                "Are you sure you want to delete this route? This action cannot be undone.",
              )
            ) {
              handleDeleteRoute(routeId);
            }
          }}
          onDuplicate={duplicateRoute}
          onReturn={handleReturn}
          selectedRouteIds={selectedRouteIds}
          onSelectedChange={handleSelectedChange}
          onSelectAllChange={handleSelectAllChange}
        />
      ) : (
        <EmptyState title="Routes" hasDepots={!!hasDepots} />
      )}

      {/* Mixed Version Export Conflict Dialog */}
      <Dialog
        open={isMixedVersionDialogOpen}
        onOpenChange={setIsMixedVersionDialogOpen}
      >
        <Dialog.Content className="w-full max-w-md flex-none p-6">
          <div className="flex w-full flex-col gap-5">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <FeatherAlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Mixed Route Versions
                  </span>
                  <span className="text-caption font-caption text-subtext-color">
                    Cannot export V1 and V2 together
                  </span>
                </div>
              </div>
              <IconButton
                variant="neutral-tertiary"
                icon={<FeatherX />}
                onClick={() => setIsMixedVersionDialogOpen(false)}
              />
            </div>

            <div className="flex flex-col gap-2 rounded-md bg-neutral-50 p-3 border border-neutral-border text-sm text-default-font">
              <p>
                You have selected both <strong>V1</strong> and <strong>V2</strong> routes.
              </p>
              <p className="text-subtext-color">
                Either V1 or V2 routes can only be exported at a time. Please filter or select routes of the same version before exporting.
              </p>
            </div>

            <div className="flex w-full items-center justify-end gap-3">
              <Button
                variant="brand-primary"
                onClick={() => setIsMixedVersionDialogOpen(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
