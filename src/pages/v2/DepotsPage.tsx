import { useDeleteDepot, useDepots } from "@/api/depot/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { CreateDepotForm, Select } from "@/ui";
import { Button } from "@/ui/components/Button";
import { Dialog } from "@/ui/components/Dialog";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { DepotCard } from "@/ui/components/DepotCard";
import { FeatherBusFront, FeatherMapPin, FeatherPlus, FeatherRefreshCw } from "@subframe/core";
import React, { useEffect, useState } from "react";
import { useRegions } from "@/api/region/hooks";
import RBAC from "@/components/RBAC";
import useAuthStore from "@/store/authStore";
import { ROLES } from "@/constants/roles";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useRegionStore } from "@/store/useRegionStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import { depotCrud, IDepot } from "@/types/IDepot";
import { toast } from "react-toastify";

export default function DepotsPage() {
   const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<IDepot | null>(null);
  
  const { selectedOrganization } = useOrganizationStore();
  const selectedRegion = useRegionStore((state) => state.selectedRegion);
  const { setSelectedRegion: setSelectedRegionInStore } = useRegionStore();

  const user = useLoggedUserStore((state) => state.user);

  const { useList: useRegionList } = regionCrud;
  const { data: regionData } = useRegionList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false
    },
    orderBy: { column: "created_at", ascending: true }
  });

  const regions = regionData?.data as IRegion[];
  
  const { useList: useDepotList, useDelete } = depotCrud;
  const { data: depotData, refetch: refetchDepots } = useDepotList({
    filters: { region_id: selectedRegion?.id || "", deleted: false },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedRegion?.id
  });

  const depots = depotData?.data as IDepot[];
  const { mutate: deleteDepot } = useDelete();

  useEffect(() => {
    if (!regions) return;
    if (!selectedRegion && regions.length > 0) {
      const firstRegion = regions[0];
      setSelectedRegionInStore(firstRegion);
    }
  }, [regions, selectedRegion, setSelectedRegionInStore]);

  const handleDeleteDepot = (depotId: string) => {
    deleteDepot(depotId, {
      onSuccess: () => {
        refetchDepots();
        toast.success("Depot deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete depot: ${error.message}`);
        console.error("Delete Error:", error);        
    } });
  };

  const handleFormSuccess = () => {
    setOpen(false);
    setEditData(null);
    refetchDepots();
  };

  


  return (
    <div className="flex h-full w-full flex-col items-start gap-4 px-12 py-12">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-2 font-heading-2 text-default-font text-center">
          Depots
        </span>
        <span className="text-body font-body text-subtext-color">
          Overview of your store&#39;s performance and customer engagement
        </span>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="text-caption font-caption text-subtext-color">
          Showing {depots?.length ?? 0} records
        </span>
       {regions && regions.length > 0 && (
        <div className="flex items-end gap-2">
          <RBAC features={[]} roles={["depot_admin", "region_admin"]}>
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

             <div className="flex justify-end items-center col-span-4 gap-2">
                      <Button
                        variant="neutral-secondary"
                        className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
                        icon={<FeatherRefreshCw />}
                        onClick={() => refetchDepots()}
                      >
                        Refresh
                      </Button>

          <RBAC
            features={[]}
            roles={["region_admin", "organization_admin", "master"]}
          >
            <Button
              icon={<FeatherPlus />}
              disabled={!selectedRegion}
              onClick={() => {
                setOpen(true);
                setEditData(null);
              }}
            >
              Add Depot
            </Button>
              </RBAC>
              </div>
        </div>)}
      </div>
      {depots && depots.length > 0 ? (
        <div className="w-full flex-col items-start gap-2 grid md:grid-cols-2 lg:grid-cols-3">
          {depots.map((depot) => (
            <DepotCard
              key={depot.id}
              icon={<FeatherBusFront />}
              locationName={depot.name}
              depotCount={
                "Created on " + new Date(depot.created_at).toLocaleDateString()
              }
              actions={
                <OptionsDropdown
                  onDelete={() =>handleDeleteDepot(depot.id)}
                  onEdit={() => {
                    setEditData(depot);
                    setOpen(true);
                  }}
                />
              }
            />
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Depots Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any {regions && regions.length === 0 ? "regions" : "depots"} added yet. Start by adding a new {regions && regions.length === 0 ? "region" : "depot"}.
            </p>
          </div>
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(open: boolean) => {
          setOpen(open);
          if (!open) setEditData(null);
        }}
      >
        <Dialog.Content>
          <CreateDepotForm
            region_id={selectedRegion ? selectedRegion.id : ""}
            initialData={editData}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpen(false);
              setEditData(null);
            }}
            organizationId={selectedOrganization ? selectedOrganization.id : ""}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
