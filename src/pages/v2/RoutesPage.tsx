import React, { useEffect } from "react";
import { Button } from "@/ui/components/Button";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherPlus, FeatherRefreshCw, FeatherTrash } from "@subframe/core";
import { Select } from "@/ui";
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
    filters: { organization_id: selectedOrganization?.id || "", deleted: false },
    orderBy: { column: "created_at", ascending: true },
  });

  const { data: depotData, refetch: refetchDepots } = depotCrud.useList({
    filters: { region_id: selectedRegion?.id || "", deleted: false },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedRegion?.id,
  });

  const { data: routesData, refetch: refetchRoutes } = routeCrud.useList({
    filters: { depot_id: selectedDepot?.id || "", deleted: false, organization_id: selectedOrganization?.id || "" },
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
    if (!depots) return;
    if (depots.length === 0 && selectedDepot) {
      setSelectedDepotInStore(null);
    } else if (depots.length > 0 && !selectedDepot) {
      setSelectedDepotInStore(depots[0]);
    }
  }, [depots, selectedDepot, setSelectedDepotInStore]);

  // Refetch on dependency changes
  useEffect(() => { refetchRegions(); }, [selectedOrganization, refetchRegions]);
  useEffect(() => { refetchDepots(); }, [selectedRegion, refetchDepots]);
  useEffect(() => { refetchRoutes(); }, [selectedDepot, selectedRegion, refetchRoutes]);

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
    navigate(`/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}/${routeId}`);
  };

  const handleDeleteRoute = (routeId: string) => {
    deleteRoute(routeId, {
      onSuccess: () => {
        toast.success("Route deleted successfully");
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(`Error deleting route: ${error.message || "Unknown error"}`);
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
          toast.error(`Error duplicating route: ${error.message || "Unknown error"}`);
        },
      },
    );
  };

  const hasRegions = regions && regions.length > 0;
  const hasDepots = depots && depots.length > 0;
  const hasRoutes = routes && routes.length > 0;

  const [selectedRouteIds, setSelectedRouteIds] = React.useState<string[]>([]);

  const handleSelectedChange = (routeId: string, selected: boolean) => {
    setSelectedRouteIds((prev) => {
      if (selected) {
        return [...prev, routeId];
      } else {
        return prev.filter((id) => id !== routeId);
      }
    });
  };

  useEffect(() => {
    if (routes) {
      const validSelectedIds = selectedRouteIds.filter((id) => routes.some((route) => route.id === id));
      if (validSelectedIds.length !== selectedRouteIds.length) {
        setSelectedRouteIds(validSelectedIds);
      } 
    }
    console.log("Selected Route IDs:", selectedRouteIds);
  }, [routes, selectedRouteIds]);


  const handleDeleteSelectedRoutes = () => {
    deleteSelectedRoutes(selectedRouteIds, {
      onSuccess: () => {
        toast.success("Selected routes deleted successfully");
        setSelectedRouteIds([]);
        refetchRoutes();
      },
      onError: (error) => {
        toast.error(`Error deleting selected routes: ${error.message || "Unknown error"}`);
      },
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-4 px-12 py-12">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">Routes</span>
        <span className="text-body font-body text-subtext-color">
          Manage routes for your Depot
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex w-full items-center justify-between">
        <span className="text-caption font-caption text-subtext-color">Showing records</span>

        {hasRegions && (
          <div className="flex items-end gap-2">
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
              onClick={() => refetchRoutes()}
            >
              Refresh
            </Button>

            <RBAC features={[]} roles={["region_admin", "organization_admin", "master", "depot_admin"]}>
              <Button
                icon={<FeatherPlus />}
                disabled={!selectedDepot}
                onClick={() =>
                  navigate(`/routes/create/${selectedOrganization?.id}/${selectedDepot?.id}`)
                }
              >
                Add Route
              </Button>
            </RBAC>
            {selectedRouteIds.length > 0 && <RBAC features={[]} roles={["region_admin", "organization_admin", "master", "depot_admin"]}>
              <Button
                icon={<FeatherTrash />}
                variant="destructive-secondary"
                disabled={!selectedDepot || selectedRouteIds.length === 0}
                onClick={() => handleDeleteSelectedRoutes()}
              >
                Delete Selected Routes
              </Button>
            </RBAC>}
          </div>
        )}
      </div>

      {/* Content */}
      {hasRoutes ? (
        <RouteTable
          routes={routes}
          onEdit={handleEditRoute}
          onDelete={handleDeleteRoute}
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
