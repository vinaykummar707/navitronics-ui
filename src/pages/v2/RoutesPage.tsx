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
import { useNavigate } from "react-router-dom";
import { RouteTable } from "@/ui/components/RouteTable";
import { DisplayConfigGetRequest } from "@/types/routeConfigV2";
import { get } from "node:http";

export default function RoutesPage() {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizationStore();

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
  const [routes, setRoutes] = React.useState<DisplayConfigGetRequest[]>([]); // Replace 'any' with your actual route type

  // function to get routes based on selected depot and organization id from supabase table routes
  const getRoutes = async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("depot_id", selectedDepot)
      .eq("organization_id", selectedOrganization?.id);

    if (error) {
      console.error("Error fetching routes:", error);
      return [];
    }
    return data;
  };

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

  React.useEffect(() => {
    if (selectedDepot && selectedOrganization) {
      getRoutes().then((routes) => {
        setRoutes(routes as DisplayConfigGetRequest[]);
      });
    }
  }, [selectedDepot, selectedOrganization]);

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

    console.log("Route deleted successfully");

    // Refetch routes after deletion and update the state
    const updatedRoutes = await getRoutes();
    setRoutes(updatedRoutes);
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
    const updatedRoutes = await getRoutes();
    setRoutes(updatedRoutes);
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
              icon={<FeatherPlus />}
              disabled={!selectedDepot}
              onClick={() =>
                navigate(
                  `/routes/create/${selectedOrganization.id}/${selectedDepot}`,
                )
              }
            >
              Add Route
            </Button>
          </RBAC>
        </div>
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
              No Routes Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any routes added yet. Start by adding a new route.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
