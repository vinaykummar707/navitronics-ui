import { useOrganizationStore } from "@/store/useOrganizationStore";
import { CreateDepotForm, Select } from "@/ui";
import { Button } from "@/ui/components/Button";
import { Drawer } from "@/ui/components/Drawer";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { Table } from "@/ui/components/Table";
import {
  FeatherBusFront,
  FeatherMapPin,
  FeatherPlus,
  FeatherRefreshCw,
} from "@subframe/core";
import React, { useEffect, useState } from "react";
import RBAC from "@/components/RBAC";
import { ROLES } from "@/constants/roles";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { useRegionStore } from "@/store/useRegionStore";
import { IRegion, regionCrud } from "@/types/IRegion";
import { depotCrud, IDepot } from "@/types/IDepot";
import { toast } from "react-toastify";
import { formatDate, sortByLatestCreated } from "@/utils/dateUtils";

export default function DepotsPage() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<IDepot | null>(null);

  const { selectedOrganization } = useOrganizationStore();

  const selectedRegion = useRegionStore(
    (state) => state.depotsPageRegion ?? state.selectedRegion,
  );
  const setDepotsPageRegion = useRegionStore(
    (state) => state.setDepotsPageRegion,
  );

  const user = useLoggedUserStore((state) => state.user);

  const { useList: useRegionList } = regionCrud;
  const { data: regionData } = useRegionList({
    filters: {
      organization_id: selectedOrganization?.id || "",
      deleted: false,
    },
    orderBy: { column: "created_at", ascending: true },
    skip: !selectedOrganization?.id,
  });

  const regions = regionData?.data as IRegion[];

  const { useList: useDepotList, useDelete } = depotCrud;
  const { data: depotData, refetch: refetchDepots } = useDepotList({
    filters: {
      region_id: selectedRegion?.id || "",
      deleted: false,
      organization_id: selectedOrganization?.id || "",
    },
    orderBy: { column: "created_at", ascending: false },
    skip: !selectedRegion?.id || !selectedOrganization?.id,
  });

  const depots = React.useMemo(() => {
    const list = (depotData?.data as IDepot[]) || [];
    return sortByLatestCreated(list);
  }, [depotData]);
  const { mutate: deleteDepot } = useDelete();

  useEffect(() => {
    if (!regions) return; // Do not clear while regions are loading

    if (regions.length === 0) {
      if (selectedRegion) {
        setDepotsPageRegion(null);
      }
      return;
    }

    const isSelectedRegionValid = regions.some(
      (region) => region.id === selectedRegion?.id,
    );

    if (!isSelectedRegionValid) {
      setDepotsPageRegion(regions[0]);
    }
  }, [regions, selectedRegion, setDepotsPageRegion, selectedOrganization]);

  const handleDeleteDepot = (depotId: string) => {
    deleteDepot(depotId, {
      onSuccess: () => {
        refetchDepots();
        toast.success("Depot deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete depot: ${error.message}`);
        console.error("Delete Error:", error);
      },
    });
  };

  const handleFormSuccess = () => {
    setOpen(false);
    setEditData(null);
    refetchDepots();
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-4 ">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-2 font-heading-2 text-default-font text-center">
          Depots
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage transit depots and operational facilities for your regions
        </span>
      </div>
      <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-caption font-caption text-subtext-color">
          Showing {depots?.length ?? 0} records
        </span>
        {regions && regions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-56 flex-none">
              <RBAC features={[]} roles={["depot_admin", "region_admin"]}>
                <Select
                  className="h-auto w-full flex-none"
                  variant="outline"
                  label="Select Region"
                  placeholder="Select Region"
                  value={selectedRegion ? selectedRegion.id : ""}
                  onValueChange={(val) =>
                    setDepotsPageRegion(
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
                  className="h-auto w-full flex-none"
                  variant="filled"
                  label="Select Region"
                  placeholder="Select Region"
                  value={selectedRegion ? selectedRegion.id : ""}
                  onValueChange={(val) =>
                    setDepotsPageRegion(
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
            </div>

            <div className="flex items-end gap-2 w-full sm:w-auto">
              <Button
                variant="neutral-primary"
                className="flex-1 sm:flex-none"
                icon={<FeatherRefreshCw />}
                onClick={() => {
                  toast.success("Depots refreshed successfully");
                  refetchDepots();
                }}
              >
                Refresh
              </Button>

              <RBAC
                features={[]}
                roles={["region_admin", "organization_admin", "master"]}
              >
                <Button
                  className="flex-1 sm:flex-none"
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
        )}
      </div>
      {depots && depots.length > 0 ? (
        <div className="flex w-full flex-col items-start overflow-x-auto touch-scroll-x rounded-md border border-solid border-neutral-border bg-default-background">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell className="min-w-[240px]">Depot Name</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[200px]">Region</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[200px]">Organization</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[150px]">Created At</Table.HeaderCell>
                <Table.HeaderCell className="w-12 justify-end" />
              </Table.HeaderRow>
            }
          >
            {depots.map((depot) => {
              const formattedDate = formatDate(depot.created_at);

              return (
                <Table.Row key={depot.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-primary border border-brand-primary/20">
                        <FeatherBusFront className="h-4 w-4" />
                      </div>
                      <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                        {depot.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="whitespace-nowrap text-body font-body text-subtext-color">
                      {selectedRegion?.name || "—"}
                    </span>
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
                    <OptionsDropdown
                      onDelete={() => {
                        if (
                          confirm("Are you sure you want to delete this depot?")
                        ) {
                          handleDeleteDepot(depot.id);
                        }
                      }}
                      onEdit={() => {
                        setEditData(depot);
                        setOpen(true);
                      }}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Depots Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any{" "}
              {regions && regions.length === 0 ? "regions" : "depots"} added
              yet. Start by adding a new{" "}
              {regions && regions.length === 0 ? "region" : "depot"}.
            </p>
          </div>
        </div>
      )}

      <Drawer
        open={open}
        onOpenChange={(open: boolean) => {
          setOpen(open);
          if (!open) setEditData(null);
        }}
      >
        <Drawer.Content>
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
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
