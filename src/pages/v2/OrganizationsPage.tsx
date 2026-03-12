"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { OrganizationCard } from "@/ui/components/OrganizationCard";
import { OrganizationList } from "@/ui/components/OrganizationList";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import {
  FeatherMoreHorizontal,
  FeatherPlus,
  FeatherRefreshCw,
} from "@subframe/core";
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "@/services/organizationService";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { Drawer } from "@/ui/components/Drawer";
import { CreateOrganizationDrawer, IconButton } from "@/ui";
import { useOrganizations } from "@/api/organization/hooks";
import { Organization } from "@/api/organization/types";
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
      />
      <OrganizationList>
        {organizations &&
          organizations.map((org) => (
            <OrganizationCard
              title={org.name}
              subtitle={org.email ? org.email : "No email provided"}
              timestamp={`Created on ${new Date(org.created_at).toLocaleDateString()}`}
              key={org.id}
              isSuspended={!org.active}
              logo2={org.logo || undefined}
              actions={
                <OptionsDropdown
                  isDisabled={org.id === "6b679098-ef69-45f0-9fb1-b457dd882060"}
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
              }
              features={
                <ButtonGroup pas={org.PAS} pis={org.PIS} itms={org.ITMS} />
              }
            />
          ))}
      </OrganizationList>

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
    </div>
  );
}

export default OrganizationsPage;
