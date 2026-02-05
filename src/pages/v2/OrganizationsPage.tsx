"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { OrganizationCard } from "@/ui/components/OrganizationCard";
import { OrganizationList } from "@/ui/components/OrganizationList";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherPlus } from "@subframe/core";
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "@/services/organizationService";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { Drawer } from "@/ui/components/Drawer";
import { CreateOrganizationDrawer } from "@/ui";
import { useOrganizations } from "@/api/organization/hooks";
import { Organization } from "@/api/organization/types";
import { ButtonGroup } from "@/ui/components/ButtonGroup";




function OrganizationsPage() {
    // Queries
    const { data, loading, error } = useOrganizations();
    const organizations = data ? data.organizations : [];
    const [editData, setEditData] = React.useState<Organization | null>(null);
    const [open, setOpen] = React.useState(false);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;


    return (
        <div className="flex h-full w-full flex-col items-start gap-6 px-12 py-12">
            <div className="flex w-full flex-col items-start gap-1">
                <span className="w-full text-heading-2 font-heading-2 text-default-font">
                    Organizations
                </span>
                <span className="text-body font-body text-subtext-color">
                    Overview of your store&#39;s performance and customer engagement
                </span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-caption font-caption text-subtext-color">
                    Showing {organizations.length} records
                </span>
                <Button
                    className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
                    variant="neutral-secondary"
                    icon={<FeatherPlus />}
                    onClick={() => { setOpen(true) }}
                >
                    Add Organization
                </Button>
            </div>
            <OrganizationList>
                {organizations && organizations.map(org => <OrganizationCard

                    title={org.name}
                    subtitle={`${org.email}/${org.regions_aggregate.aggregate.count} Regions/${org.depots_aggregate.aggregate.count} Depots` || "No email provided"}
                    key={org.id}
                    isSuspended={!org.active}
                    logo2={org.logo || undefined}
                    actions={<OptionsDropdown onEdit={() => { setEditData(org); setOpen(true); }} onDelete={() => { alert(`Delete clicked for ${org.id}`) }} />}
                    features={<ButtonGroup pas={org.PAS} pis={org.PIS} itms={org.ITMS} />}

                />)}

            </OrganizationList>

            <Drawer open={open} onOpenChange={setOpen}>
                <Drawer.Content>
                    <CreateOrganizationDrawer initialData={editData} onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
                </Drawer.Content>
            </Drawer>
        </div>
    );
}

export default OrganizationsPage;