import PageHeader from "@/components/PageHeader";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useRegionStore } from "@/store/useRegionStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import { CreateRegionForm } from "@/ui";
import { Button } from "@/ui/components/Button";
import { Drawer } from "@/ui/components/Drawer";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { Table } from "@/ui/components/Table";
import { FeatherMapPin, FeatherPlus } from "@subframe/core";
import React from "react";
import { toast } from "react-toastify";
import { formatDate, sortByLatestCreated } from "@/utils/dateUtils";
import RBAC from "@/components/RBAC";
import { confirmRegionDelete } from "@/utils/deleteImpact";

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
    },
    orderBy: { column: "created_at", ascending: false },
    skip: !selectedOrganization?.id,
  });
  const { mutate: deleteRegion } = useDelete();
  const [editData, setEditData] = React.useState<IRegion | null>(null);
  const regions = React.useMemo(() => {
    const list = data ? (data.data as IRegion[]) : [];
    return sortByLatestCreated(list);
  }, [data]);
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
        roles={["organization_admin", "master"]}
      />

      {regions && regions.length > 0 ? (
        <div className="flex w-full flex-col items-start overflow-x-auto rounded-md border border-solid border-neutral-border bg-default-background touch-scroll-x">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell className="min-w-[240px]">Region Name</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[200px]">Organization</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[150px]">Created At</Table.HeaderCell>
                <Table.HeaderCell className="w-12 justify-end" />
              </Table.HeaderRow>
            }
          >
            {regions.map((region) => {
              const formattedDate = formatDate(region.created_at);

              return (
                <Table.Row key={region.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-primary border border-brand-primary/20">
                        <FeatherMapPin className="h-4 w-4" />
                      </div>
                      <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                        {region.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="whitespace-nowrap text-body font-body text-subtext-color">
                      {selectedOrganization?.name || "—"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                      {formattedDate}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="justify-end">
                    <RBAC features={[]} roles={["organization_admin", "master"]}>
                      <OptionsDropdown
                        onDelete={async () => {
                          if (await confirmRegionDelete(region.id)) {
                            handleDeleteRegion(region);
                          }
                        }}
                        onEdit={() => {
                          setEditData(region);
                          setOpen(true);
                        }}
                      />
                    </RBAC>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table>
        </div>
      ) : !loading ? (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Regions Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any regions added yet. Start by adding a new
              region.
            </p>
            <RBAC features={[]} roles={["organization_admin", "master"]}>
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
            </RBAC>
          </div>
        </div>
      ) : null}
      <Drawer
        open={open}
        onOpenChange={(open: boolean) => {
          setOpen(open);
          if (!open) setEditData(null);
        }}
      >
        <Drawer.Content>
          <CreateRegionForm
            initialData={editData}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setOpen(false);
              setEditData(null);
            }}
            organizationId={selectedOrganization ? selectedOrganization.id : ""}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
