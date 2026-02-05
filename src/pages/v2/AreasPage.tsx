import { useDeleteRegion, useRegions } from "@/api/region/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { CreateRegionForm } from "@/ui";
import { Button } from "@/ui/components/Button";
import { Dialog } from "@/ui/components/Dialog";
import { OptionsDropdown } from "@/ui/components/OptionsDropdown";
import { RegionCard } from "@/ui/components/RegionCard";
import { FeatherMapPin, FeatherPlus } from "@subframe/core";
import React from "react";

export default function AreasPage() {
    const [open, setOpen] = React.useState(false);
    const { selectedOrganization } = useOrganizationStore();
    const { data: regions, loading, error, refetch } = useRegions({ variables: { organization_id: selectedOrganization.id || "" } })
    const [editData, setEditData] = React.useState<any>(null);
    const [deleteRegion, { loading: deleting, error: deleteError }] = useDeleteRegion();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // Handler to call refetch after create/update
    const handleFormSuccess = () => {
        setOpen(false);
        setEditData(null);
        refetch();
    };

    return (
        <div className="flex h-full w-full flex-col items-start gap-4 px-12 py-12">
            <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                    Regions
                </span>
                <span className="text-body font-body text-subtext-color">
                    Overview of your store&#39;s performance and customer engagement
                </span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-caption font-caption text-subtext-color">
                    Showing {regions.regions?.length ?? 0} records
                </span>
                <Button
                    variant="brand-secondary-2"
                    icon={<FeatherPlus />}
                    onClick={() => { setOpen(true); setEditData(null); }}
                >
                    Add Region
                </Button>
            </div>
            <div className="w-full flex-col items-start gap-2 grid grid-cols-3">
                {regions.regions && regions.regions.map(region => (
                    <RegionCard
                        key={region.id}
                        icon={<FeatherMapPin />}
                        locationName={region.name}
                        depotCount={region.depots_aggregate.aggregate.count + ' Depots Found'}
                        actions={
                            <OptionsDropdown
                                onDelete={async () => {
                                    await deleteRegion({ variables: { id: region.id } });
                                    refetch(); // Refetch regions after delete
                                }}
                                onEdit={() => { setEditData(region); setOpen(true); }}
                            />
                        }
                    />
                ))}
            </div>
            <Dialog open={open} onOpenChange={(open: boolean) => { setOpen(open); if (!open) setEditData(null); }}>
                <Dialog.Content>
                    <CreateRegionForm
                        region={editData}
                        onSuccess={handleFormSuccess}
                        onCancel={() => { setOpen(false); setEditData(null); }}
                        organizationId={selectedOrganization.id || ""}
                    />
                </Dialog.Content>
            </Dialog>
        </div>
    )
};