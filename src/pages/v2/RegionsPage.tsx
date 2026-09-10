import PageHeader from "@/components/PageHeader";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import { CreateRegionForm } from "@/ui";
import { Button } from "@/ui/components/Button";
import { Dialog } from "@/ui/components/Dialog";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { RegionCard } from "@/ui/components/RegionCard";
import { FeatherMapPin, FeatherPlus } from "@subframe/core";
import React from "react";
import { toast } from "react-toastify";

export default function AreasPage() {
  const [open, setOpen] = React.useState(false);
  const { selectedOrganization } = useOrganizationStore();
  const { useList, useDelete } = regionCrud;
  const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useList({
    filters: {
      organization_id: selectedOrganization ? selectedOrganization.id : "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedOrganization?.id,
  });
  const { mutate: deleteRegion } = useDelete();
  const [editData, setEditData] = React.useState<IRegion | null>(null);
  const regions = data ? (data.data as IRegion[]) : ([] as IRegion[]);
  const { setSelectedRegion, selectedRegion } = useRegionStore();

  // Handler to call refetch after create/update
  const handleFormSuccess = () => {
    setOpen(false);
    setEditData(null);
    refetch();
  };

  const handleDeleteRegion = (region: IRegion) => {
    deleteRegion(region.id, {
      onSuccess: () => {
        refetch();
        if (setSelectedRegion && region.id === selectedRegion?.id) {
          setSelectedRegion(null);
        }
        toast.success("Region deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete region: ${error.message}`);
        console.error("Delete Error:", error);
      },
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-4 ">
      {regions.length > 0 && (
        <PageHeader
          title="Regions"
          subtitle="Manage geographic regions and transit operational zones"
          count={regions.length}
          onRefetch={refetch}
          onAdd={() => {
            setOpen(true);
            setEditData(null);
          }}
          buttonLabel="Add Region"
          roles={["region_admin", "organization_admin", "master"]}
        />
      )}
      <div className="w-full flex-col items-start gap-2 grid md:grid-cols-2 lg:grid-cols-3">
        {regions &&
          regions.map((region) => (
            <RegionCard
              key={region.id}
              icon={<FeatherMapPin />}
              locationName={region.name}
              depotCount={
                "Created on " + new Date(region.created_at).toLocaleDateString()
              }
              actions={
                <OptionsDropdown
                  onDelete={() => {
                    if (
                      confirm("Are you sure you want to delete this region?")
                    ) {
                      handleDeleteRegion(region);
                    }
                  }}
                  onEdit={() => {
                    setEditData(region);
                    setOpen(true);
                  }}
                />
              }
            />
          ))}
      </div>
      {!loading && regions.length === 0 && (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Regions Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any regions added yet. Start by adding a new
              region.
            </p>
            <Button
              variant=""
              icon={<FeatherPlus />}
              onClick={() => {
                setOpen(true);
                setEditData(null);
              }}
              className="mt-4"
            >
              Add Region
            </Button>
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
          <CreateRegionForm
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
