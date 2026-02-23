import React, { useEffect } from "react";
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
  FeatherRefreshCw,
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
import { useNavigate } from "react-router-dom";
import { RouteTable } from "@/ui/components/RouteTable";
import { DisplayConfigGetRequest } from "@/types/routeConfigV2";
import { get } from "node:http";
import { useRegionStore } from "@/store/useRegionStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useDepotStore } from "@/store/useDepotStore";
import { depotCrud, IDepot } from "@/types/IDepot";
import { IRoute, routeCrud } from "@/types/IRoute";

export default function RoutesPage() {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizationStore();

  const selectedRegion = useRegionStore((state) => state.selectedRegion);
  const { setSelectedRegion: setSelectedRegionInStore } = useRegionStore();
  const { useList: useRegionList } = regionCrud;
  const { data: regionData, refetch: refetchRegions } = useRegionList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
  });

  const regions = regionData?.data as IRegion[];
  const user = useLoggedUserStore((state) => state.user);

  const selectedDepot = useDepotStore((state) => state.selectedDepot);
  const { setSelectedDepot: setSelectedDepotInStore } = useDepotStore();
  const { useList: useDepotList } = depotCrud;
  const { data: depotData, refetch: refetchDepots } = useDepotList({
    filters: { region_id: selectedRegion?.id || "", deleted: false },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedRegion?.id,
  });

  const depots = depotData?.data as IDepot[];

  const { useList: useRoutesList, useDelete } = routeCrud;
  const { data: routesData, refetch: refetchRoutes } = useRoutesList({
    filters: { depot_id: selectedDepot?.id || "", deleted: false },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedDepot?.id,
  });

  const routes = routesData?.data as IRoute[];

  useEffect(() => {
    if (!regions) return;
    if (!selectedRegion && regions.length > 0) {
      const firstRegion = regions[0];
      setSelectedRegionInStore(firstRegion);
    }
  }, [regions, selectedRegion, setSelectedRegionInStore]);

  // by default select first depot

  useEffect(() => {
    if (selectedDepot && depots && depots.length === 0) {
      setSelectedDepotInStore(null);
    }
    if (!selectedDepot && depots && depots.length > 0) {
      const firstDepot = depots[0];
      setSelectedDepotInStore(firstDepot);
    }
  }, [depots, selectedDepot, setSelectedDepotInStore]);

  //refetch regions when selectedOrganization changes and refetch depots when selectedRegion changes in useEffect
  useEffect(() => {
    refetchRegions();
  }, [selectedOrganization, refetchRegions]);

  useEffect(() => {
    refetchDepots();
  }, [selectedRegion, refetchDepots]);

  useEffect(() => {
    refetchRoutes();
  }, [selectedDepot, refetchRoutes, selectedRegion]);

  function handleEditRoute(routeId: string): void {
    navigate(
      `/routes/create/${selectedOrganization?.id}/${selectedDepot}/${routeId}`,
    );
  }

  const deleteRoute = async (routeId: string) => {
    const { error } = await supabase
      .from("routes")
      .delete()
      .match({ id: routeId });

    if (error) {
      console.error("Error deleting route:", error);
      return;
    }
  };

  const duplicateRoute = async (routeId: string, routeNumberSuffix: string) => {
    const { data: originalRoute, error: fetchError } = await supabase
      .from("routes")
      .select("*")
      .eq("id", routeId)
      .single();

    if (fetchError || !originalRoute) {
      console.error("Error fetching route to duplicate:", fetchError);
      return;
    }

    // Destructuring to exclude 'id' from the new route object
    const { id, ...routeWithoutId } = originalRoute;
    const newRouteNumber = `${originalRoute.route_number}${routeNumberSuffix}`;

    const { data: duplicatedRoute, error: duplicateError } = await supabase
      .from("routes")
      .insert([{ ...routeWithoutId, route_number: newRouteNumber }]);

    if (duplicateError) {
      console.error("Error duplicating route:", duplicateError);
      return;
    }

    console.log("Duplicated route successfully:", duplicatedRoute);
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-4 px-12 py-12">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          Routes
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage routes for your Depot
        </span>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="text-caption font-caption text-subtext-color">
          Showing records
        </span>
        {regions && regions.length > 0 && (
          <div className="flex items-end gap-2">
            <RBAC features={[]} roles={["depot_admin", "region_admin"]}>
              <Select
                className="h-auto  flex-none"
                variant="outline"
                label=" Select Region"
                placeholder="Select Region"
                value={selectedRegion ? selectedRegion.id : ""}
                onValueChange={(val) =>
                  setSelectedRegionInStore(
                    regions.find((r) => r.id === val) || null,
                  )
                }
              >
                {regions
                  .filter((region) => user?.region?.id === region.id)
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
                label="Select Region"
                placeholder="Select Region"
                value={selectedRegion ? selectedRegion.id : ""}
                onValueChange={(val) =>
                  setSelectedRegionInStore(
                    regions.find((r) => r.id === val) || null,
                  )
                }
              >
                {regions.map((region) => (
                  <Select.Item key={region.id} value={region.id}>
                    {region.name}
                  </Select.Item>
                ))}
              </Select>
            </RBAC>
            {depots && depots.length > 0 && (
              <RBAC features={[]} roles={["master", "organization_admin"]}>
                <Select
                  className="h-auto  flex-none"
                  variant="outline"
                  label=" Select Depot"
                  placeholder="Select Depot"
                  value={selectedDepot ? selectedDepot.id : ""}
                  onValueChange={(val) =>
                    setSelectedDepotInStore(
                      depots.find((d) => d.id === val) || null,
                    )
                  }
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
                    `/routes/create/${selectedOrganization.id}/${selectedDepot.id}`,
                  )
                }
              >
                Add Route
              </Button>
            </RBAC>
          </div>
        )}
      </div>

      {routes && routes.length > 0 ? (
        <RouteTable
          routes={routes}
          onEdit={handleEditRoute}
          onDelete={deleteRoute}
          onDuplicate={duplicateRoute}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No {depots.length === 0 ? "depots" : "routes"} Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any {depots.length === 0 ? "depots" : "routes"} added yet. Start by adding a new {depots.length === 0 ? "depot" : "route"}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
