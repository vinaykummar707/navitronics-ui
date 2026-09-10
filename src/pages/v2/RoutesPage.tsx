import React, { useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherDownload,
  FeatherPanelLeft,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherTrash,
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
import { ExportFormatDialog } from "@/components/ExportFormatDialog";


// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Sub-components ──────────────────────────────
function useRoutesPageData() {
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

  // Auto-select first region
  useEffect(() => {
    if (regions?.length > 0 && !selectedRegion) {
      setSelectedRegionInStore(regions[0]);
    }
  }, [regions, selectedRegion, setSelectedRegionInStore]);

  // Auto-select / clear depot
  useEffect(() => {
    if (!depots || depots.length === 0) {
      if (selectedDepot) {
        setSelectedDepotInStore(null);
      }
      return;
    }

    const isSelectedDepotValid = depots.some(
      (depot) => depot.id === selectedDepot?.id,
    );

    if (!isSelectedDepotValid) {
      setSelectedDepotInStore(depots[0]);
    }
  }, [depots, selectedDepot, setSelectedDepotInStore]);

  return {
    user,
    regions,
    depots,
    routes,
    selectedRegion,
    selectedDepot,
    selectedOrganization,
    setSelectedRegionInStore,
    setSelectedDepotInStore,
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
    setSelectedRegionInStore,
    setSelectedDepotInStore,
    refetchRoutes,
  } = useRoutesPageData();

  const { mutate: deleteRoute } = routeCrud.useDelete();
  const { mutate: deleteSelectedRoutes } = routeCrud.useDeleteAll();
  const { mutate: createRoute } = routeCrud.useCreate();

  const handleRegionChange = (val: string) =>
    setSelectedRegionInStore(regions.find((r) => r.id === val) || null);

  const handleDepotChange = (val: string) =>
    setSelectedDepotInStore(depots.find((d) => d.id === val) || null);

  const handleEditRoute = (routeId: string) => {
    navigate(
      `/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}/${routeId}`,
    );
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

  const hasRegions = regions && regions.length > 0;
  const hasDepots = depots && depots.length > 0;
  const hasRoutes = routes && routes.length > 0;

  const [selectedRouteIds, setSelectedRouteIds] = React.useState<string[]>([]);

  const selectedRouteIdsSet = React.useMemo(
    () => new Set(selectedRouteIds),
    [selectedRouteIds]
  );

  const selectedRouteObjects = React.useMemo(() => {
    if (!routes || selectedRouteIds.length === 0) return [];
    return routes.filter((route) => selectedRouteIdsSet.has(route.id));
  }, [routes, selectedRouteIdsSet]);

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
    if (selected && routes) {
      setSelectedRouteIds(routes.map((r) => r.id));
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

  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false);

  const handleExportSelectedRoutes = () => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }
    setIsExportDialogOpen(true);
  };

  const executeExport = async (format: "v1" | "v2") => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
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

        // Trigger zip file download from binary response data
        const blob = new Blob([response.data], { type: "application/zip" });
        saveAs(blob, `routes_export_v1_${currentDate}.zip`);
        toast.success(`Exported ${selectedRouteObjects.length} route(s) in V1 format`);
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

        // Trigger zip file download from binary response data
        const blob = new Blob([response.data], { type: "application/zip" });
        saveAs(blob, `routes_export_v2_${currentDate}.zip`);
        toast.success(`Exported ${selectedRouteObjects.length} route(s) in V2 format`);
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
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:items-start gap-4">
        <span className="text-caption font-caption text-subtext-color">
          Showing records
        </span>

        {hasRegions && (
          <div className="flex items-end gap-2 mobile:w-full mobile:grid mobile:grid-cols-2">
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

            <Button
              variant="neutral-secondary"
              className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
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
              <Button
                icon={<FeatherPlus />}
                disabled={!selectedDepot}
                onClick={() =>
                  navigate(
                    `/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}`,
                  )
                }
              >
                Add Route
              </Button>
            </RBAC>
            {selectedRouteIds.length > 0 && (
              <>
                <Button
                  icon={<FeatherDownload />}
                  variant="brand-secondary-2"
                  disabled={!selectedDepot || selectedRouteIds.length === 0}
                  onClick={handleExportSelectedRoutes}
                >
                  Export Selected Routes
                </Button>
                <Button
                  icon={<FeatherTrash />}
                  variant="destructive-secondary"
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
                  Delete Selected Routes
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {hasRoutes ? (
        <RouteTable
          routes={routes}
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

      <ExportFormatDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        selectedCount={selectedRouteIds.length}
        onConfirmExport={executeExport}
      />
    </div>
  );
}
