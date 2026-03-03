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
    skip: !selectedDepot?.id,
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
    const firstDepot = depots ? depots[0] : [];
    const isSelectedDepotValid = depots?.some(
      (depot) => depot.id === selectedDepot?.id,
    );
    const noSelectedDepotFound = !selectedDepot && depots.length > 0;

    if (!depots) return;

    if ((noSelectedDepotFound || !isSelectedDepotValid) && firstDepot) {
      setSelectedDepotInStore(firstDepot);
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
    refetchRoutes();
  }, [selectedDepot, selectedRegion, refetchRoutes]);

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
    createRoute(
      {
        ...routeWithoutId,
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
          toast.error(`Error eturn Route: ${error.message || "Unknown error"}`);
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
  const [selectedRouteObjects, setSelectedRouteObjects] = React.useState<
    IRoute[]
  >([]);

  const handleSelectedChange = (routeId: string, selected: boolean) => {
    setSelectedRouteIds((prev) => {
      if (selected) {
        return [...prev, routeId];
      } else {
        return prev.filter((id) => id !== routeId);
      }
    });
    setSelectedRouteObjects((prev) => {
      if (selected) {
        const routeToAdd = routes?.find((route) => route.id === routeId);
        if (routeToAdd) {
          return [...prev, routeToAdd];
        }
      } else {
        return prev.filter((route) => route.id !== routeId);
      }
      return [];
    });
  };

  useEffect(() => {
    if (routes) {
      const validSelectedIds = selectedRouteIds.filter((id) =>
        routes.some((route) => route.id === id),
      );
      if (validSelectedIds.length !== selectedRouteIds.length) {
        setSelectedRouteIds(validSelectedIds);
      }
    }
    console.log("Selected Route IDs:", selectedRouteIds);
    console.log("Selected Route Objects:", selectedRouteObjects);
  }, [routes, selectedRouteIds, selectedRouteObjects]);

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
    fieldValue: string | null,
    fieldKey: string,
    json: IRoute,
  ) => {
    if (fieldValue === null || fieldValue === undefined) {
      return null;
    }
    return JSON.parse(json[fieldKey] as string);
  };

  // function to parse each selected route's data and trigger download of a json file for all selected routes in one json file name `routes_export_${currentDate}.json`
  const handleExportSelectedRoutes = () => {
    if (selectedRouteObjects.length === 0) {
      toast.warning("No routes selected for export");
      return;
    }
    // parse only fields front,side,rear,internal and stops for each selected route and create a new array of objects with only those fields and the id and route_number fields
    const routesToExport = selectedRouteObjects.map((route) => ({
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

    console.log("Routes to Export:", routesToExport);
    // create a json file with routesToExport and trigger download
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `routes_export_${currentDate}.json`;
    const fileContent = JSON.stringify(routesToExport, null, 2);
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        />
      ) : (
        <EmptyState title="Routes" hasDepots={!!hasDepots} />
      )}
    </div>
  );
}
