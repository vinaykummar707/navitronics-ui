import { useDeleteDepot, useDepots } from "@/api/depot/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { CreateDepotForm, Select } from "@/ui";
import { Button } from "@/ui/components/Button";
import { Dialog } from "@/ui/components/Dialog";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { DepotCard } from "@/ui/components/DepotCard";
import { FeatherBusFront, FeatherMapPin, FeatherPlus } from "@subframe/core";
import React from "react";
import { useRegions } from "@/api/region/hooks";
import RBAC from "@/components/RBAC";
import useAuthStore from "@/store/authStore";
import { ROLES } from "@/constants/roles";

export default function DepotsPage() {
  const [open, setOpen] = React.useState(false);
  const { selectedOrganization } = useOrganizationStore();
  const {
    data: regionData,
    loading: regionsLoading,
    error: regionsError,
  } = useRegions({
    variables: { organization_id: selectedOrganization.id || "" },
  });
  const regions = regionData?.regions || [];
  const [selectedRegion, setSelectedRegion] = React.useState<string | null>(
    null,
  );
  const depotsQueryEnabled = !!selectedRegion;
  const [editData, setEditData] = React.useState<any>(null);
  const [deleteDepot, { loading: deleting, error: deleteError }] =
    useDeleteDepot();

  // Only call useDepots if there's a selectedRegion
  const {
    data: depots,
    loading,
    error,
    refetch,
  } = useDepots({
    variables: {
      organization_id: selectedOrganization.id || "",
      region_id: selectedRegion || "",
    },
    skip: !depotsQueryEnabled, // Only run if enabled
  });

  const user = useAuthStore((state) => state.user); // Get user details

  // Set default region once regions are loaded
  React.useEffect(() => {
    console.log("Regions loaded:", regions);
    if (regions.length > 0) {
      if (
        user.userRole === ROLES.MASTER ||
        user.userRole === ROLES.ORGANIZATION_ADMIN
      ) {
        setSelectedRegion(regions[0].id);
      }
      if (
        user.userRole === ROLES.REGION_ADMIN ||
        user.userRole === ROLES.DEPOT_ADMIN
      ) {
        const userRegion = regions.find(
          (region) => region.id === user?.area.areaId,
        );
        setSelectedRegion(userRegion ? userRegion.id : regions[0].id);
      }
    }
  }, [regions]);

  const handleFormSuccess = () => {
    setOpen(false);
    setEditData(null);
    refetch();
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
          Showing {depots?.depots?.length ?? 0} records
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
          <RBAC
            features={[]}
            roles={["region_admin", "organization_admin", "master"]}
          >
            <Button
              variant=""
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
      </div>
      {depots?.depots ? (
        <div className="w-full flex-col items-start gap-2 grid md:grid-cols-2 lg:grid-cols-3">
          {depots.depots.map((depot) => (
            <DepotCard
              key={depot.id}
              icon={<FeatherBusFront />}
              locationName={depot.name}
              depotCount={
                "Created on " + new Date(depot.created_at).toLocaleDateString()
              }
              actions={
                <OptionsDropdown
                  onDelete={async () => {
                    await deleteDepot({ variables: { id: depot.id } });
                    refetch();
                  }}
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
              You do not have any depots added yet. Start by adding a new depot.
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
            region_id={selectedRegion}
            depot={editData}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpen(false);
              setEditData(null);
            }}
            organizationId={selectedOrganization.id || ""}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
