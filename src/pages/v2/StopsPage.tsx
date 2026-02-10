"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { OrganizationCard } from "@/ui/components/OrganizationCard";
import { OrganizationList } from "@/ui/components/OrganizationList";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherMusic, FeatherPin, FeatherPlay, FeatherPlus, FeatherTrash } from "@subframe/core";
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




function StopsPage() {
  // Queries
  const { selectedOrganization } = useOrganizationStore();


  const [editData, setEditData] = React.useState<Organization | null>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(null);
  const { data: regionData, refetch: regionRefetch } = useRegions({ variables: { organization_id: selectedOrganization ? selectedOrganization.id : "" } });
  const regions = regionData?.regions || [];
  const user = useAuthStore((state) => state.user); // Get user details


  const [selectedDepot, setSelectedDepot] = React.useState<string | null>(null);
  const { data: depotData, refetch: depotRefetch } = useDepots({ variables: { organization_id: selectedOrganization ? selectedOrganization.id : "", region_id: selectedRegion } });
  const depots = depotData?.depots || [];




  const { data, loading, error, refetch: stopsRefetch } = useStops({ variables: { organization_id: selectedOrganization?.id, depot_id: selectedDepot } });
  const stops = data ? data.stops : [];





  // bydefault select first region
  React.useEffect(() => {
    console.log("Regions loaded:", regions);
    if (regions.length > 0) {
      if (user.userRole === 'master' || user.userRole === 'organization_admin') {
        setSelectedRegion(regions[0].id);
      }
      if (user.userRole === 'region_admin' || user.userRole === 'depot_admin') {
        const userRegion = regions.find(region => region.id === user?.area.areaId);
        setSelectedRegion(userRegion ? userRegion.id : regions[0].id);
      }
    }
  }, [regions]);


  // by default select first depot
  React.useEffect(() => {
    if (depots.length > 0) {
      if (user.userRole === 'master' || user.userRole === 'organization_admin') {
        setSelectedDepot(depots[0].id);
      }
      if (user.userRole === 'region_admin' || user.userRole === 'depot_admin') {
        const userDepot = depots.find(depot => depot.id === user?.area.areaId);
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




  return (
    <div className="flex h-full w-full flex-col items-start gap-6 px-12 py-12">
      {stops.length > 0 && <><div className="flex w-full flex-col items-start gap-1">
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
            <RBAC features={[]} roles={['depot_admin', 'region_admin',]}>
              <Select
                className="h-auto  flex-none"
                variant="outline"
                label=""
                placeholder="Select Region"
                value={selectedRegion || ""}
                onValueChange={val => setSelectedRegion(val)}
              >
                {regions.filter(region => user?.area.areaId === region.id).map(region => (
                  <Select.Item key={region.id} value={region.id}>
                    {region.name}
                  </Select.Item>
                ))}
              </Select>
            </RBAC>

            <RBAC features={[]} roles={['master', 'organization_admin']}>
              <Select
                className="h-auto  flex-none"
                variant="outline"
                label=""
                placeholder="Select Region"
                value={selectedRegion || ""}
                onValueChange={val => setSelectedRegion(val)}
              >
                {regions.map(region => (
                  <Select.Item key={region.id} value={region.id}>
                    {region.name}
                  </Select.Item>
                ))}
              </Select>

            </RBAC>


            <RBAC features={[]} roles={['master', 'organization_admin']}>
              <Select
                className="h-auto  flex-none"
                variant="outline"
                label=""
                placeholder="Select Depot"
                value={selectedDepot || ""}
                onValueChange={val => setSelectedDepot(val)}
              >
                {depots.map(depot => (
                  <Select.Item key={depot.id} value={depot.id}>
                    {depot.name}
                  </Select.Item>
                ))}
              </Select>

            </RBAC>


            <RBAC features={[]} roles={['region_admin', 'organization_admin', 'master']}>
              <Button
                variant=""
                icon={<FeatherPlus />}
                onClick={() => { setOpen(true); setEditData(null); }}
              >
                Add Stop
              </Button>
            </RBAC>
          </div>
        </div>

        <div className="w-full flex-col items-start gap-2 grid grid-cols-2">
          {stops && stops.map(stop => (
            <StopDetailsCard
              icon={<FeatherPin />}
              title={stop.name}
              downwardLatitude={stop.down_latitude}
              downwardLongitude={stop.down_longitude}
              upwardLatitude={stop.up_latitude}
              upwardLongitude={stop.up_longitude}
              audioFile={
                <AudioFileContainer
                  fileName="KUSHAIGUDA.mp3"
                  fileSize="No Audio File Found"
                  isAudioAvailable={stop.stop_audios && stop.stop_audios.length > 0 ? true : false}
                  actions={
                    <>
                      <Button
                        className="hidden h-8 w-auto flex-none"
                        disabled={false}
                        variant="brand-primary"
                        size="medium"
                        icon={null}
                        iconRight={null}
                        loading={false}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => { }}
                      >
                        Button
                      </Button>
                      <Button
                        className="h-8 w-auto flex-none"
                        disabled={false}
                        variant="brand-primary"
                        size="medium"
                        icon={<FeatherMusic />}
                        iconRight={null}
                        loading={false}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => { }}
                      >
                        Generate Audio
                      </Button>
                    </>
                  }
                  audioFileActions={
                    <>

                      <Button
                        className="h-8 w-auto flex-none"
                        disabled={false}
                        variant="brand-primary"
                        size="medium"
                        icon={<FeatherPlay />}
                        iconRight={null}
                        loading={false}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => { }}
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
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => { }}
                      >
                        Delete
                      </Button>
                    </>
                  }
                />
              }
            />
          ))
          }

        </div>
      </>}

      {!loading && stops.length === 0 && (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">

            <h2 className="text-heading-2 font-heading-2 text-default-font">No Stops Found</h2>
            <p className="text-body font-body text-subtext-color">You do not have any stops added yet. Start by adding a new stop.</p>
            <Button
              variant=""
              icon={<FeatherPlus />}
              onClick={() => { setOpen(true); setEditData(null); }}
              className="mt-4"
            >
              Add Stop
            </Button>
          </div>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <CreateStopForm />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}

export default StopsPage;