"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Table } from "@/ui/components/Table";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherCheck,
  FeatherMoreHorizontal,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherX,
} from "@subframe/core";
import { useQuery } from "@tanstack/react-query";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { Drawer } from "@/ui/components/Drawer";
import { CreateOrganizationDrawer, IconButton } from "@/ui";
import { STUOnboardingWizard } from "@/ui/components/STUOnboardingWizard";
import { ButtonGroup } from "@/ui/components/ButtonGroup";
import RBAC from "@/components/RBAC";
import { supabase } from "@/supabaseClient";
import { IOrganization, organizationCrud } from "@/types/organization";
import PageHeader from "@/components/PageHeader";
import { toast } from "react-toastify";

function OrganizationsPage() {
  // Queries
  const { useList, useDelete } = organizationCrud;
  const { data, isLoading, isError, refetch } = useList({
    filters: { deleted: false },
    orderBy: { column: "created_at", ascending: true },
  });
  const { mutate: deleteOrganization } = useDelete();
  const organizations = data
    ? (data.data as IOrganization[])
    : ([] as IOrganization[]);
  const [editData, setEditData] = React.useState<IOrganization | null>(null);
  const [open, setOpen] = React.useState(false);
  const [wizardOpen, setWizardOpen] = React.useState(false);

  const handleDelete = (id: string) => {
    deleteOrganization(id, {
      onSuccess: () => {
        refetch();
        toast.success("Organization deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete organization: ${error.message}`);
        console.error("Delete Error:", error);
      },
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-6 ">
      <PageHeader
        title="Organizations"
        subtitle="Manage your organizations and their details here."
        count={organizations.length}
        onRefetch={refetch}
        onAdd={() => {
          setEditData(null);
          setOpen(true);
        }}
        buttonLabel="Add Organization"
        roles={["master"]}
        extraActions={
          <Button
            variant="brand-secondary-2"
            className="flex-1 sm:flex-none"
            icon={<FeatherPlus />}
            onClick={() => setWizardOpen(true)}
          >
            Onboard STU Customer
          </Button>
        }
      />
      {isLoading && (
        <div className="flex w-full items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-800" />
        </div>
      )}
      {isError && (
        <div className="flex w-full items-center justify-center p-8 text-error-700">
          Failed to load organizations. Please click refresh to try again.
        </div>
      )}
      {!isLoading && !isError && organizations.length > 0 && (
        <div className="flex w-full flex-col items-start overflow-x-auto rounded-md border border-solid border-neutral-border bg-default-background touch-scroll-x">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell className="min-w-[220px]">Organization</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[130px] justify-center text-center">Customer Tier</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[180px]">Contact Email</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[120px] justify-center text-center">Status</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[200px]">Active Modules</Table.HeaderCell>
                <Table.HeaderCell className="min-w-[150px]">Created At</Table.HeaderCell>
                <Table.HeaderCell className="w-12 justify-end" />
              </Table.HeaderRow>
            }
          >
            {organizations.map((org) => {
              const isNavitronix =
                org.name?.toLowerCase() === "navitronix" ||
                (org as any).is_default ||
                org.id === "6b679098-ef69-45f0-9fb1-b457dd882060";
              const formattedDate = org.created_at
                ? new Date(org.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <Table.Row key={org.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="small"
                        image={org.logo || undefined}
                      >
                        {org.name ? org.name.slice(0, 2).toUpperCase() : "OG"}
                      </Avatar>
                      <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                        {org.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="justify-center text-center">
                    <Badge
                      variant={isNavitronix ? "neutral" : "brand"}
                    >
                      {isNavitronix
                        ? "System Org"
                        : org.customer_type === "regular"
                        ? "Regular"
                        : "STU Enterprise"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="whitespace-nowrap text-body font-body text-subtext-color">
                      {org.email || "No email provided"}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="min-w-[120px] justify-center text-center">
                    {org.active ? (
                      <Badge variant="success" icon={<FeatherCheck className="h-3 w-3" />}>Active</Badge>
                    ) : (
                      <Badge variant="error" icon={<FeatherX className="h-3 w-3" />}>Suspended</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <ButtonGroup pas={org.PAS} pis={org.PIS} itms={org.ITMS} />
                  </Table.Cell>
                  <Table.Cell>
                    <span className="whitespace-nowrap text-caption font-caption text-subtext-color">
                      {formattedDate}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="justify-end">
                    <OptionsDropdown
                      isDisabled={isNavitronix}
                      onEdit={() => {
                        setEditData(org);
                        setOpen(true);
                      }}
                      onDelete={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this organization? This action cannot be undone.",
                          )
                        ) {
                          handleDelete(org.id);
                        }
                      }}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table>
        </div>
      )}
      {!isLoading && !isError && organizations.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center p-12 gap-2 text-center">
          <span className="text-heading-3 font-heading-3 text-default-font">No Organizations Found</span>
          <span className="text-body font-body text-subtext-color">Start by adding your first organization.</span>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <Drawer.Content>
          <CreateOrganizationDrawer
            initialData={editData}
            onSuccess={() => {
              refetch();
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </Drawer.Content>
      </Drawer>

      <STUOnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          refetch();
          toast.success("Organization list refreshed");
        }}
      />
    </div>
  );
}

export default OrganizationsPage;
