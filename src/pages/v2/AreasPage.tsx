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
    const { data, loading, error, refetch } = useRegions({ variables: { organization_id: selectedOrganization ? selectedOrganization.id : "" } })
    const [editData, setEditData] = React.useState<any>(null);
    const [deleteRegion, { loading: deleting, error: deleteError }] = useDeleteRegion();
    const regions = data?.regions || [];


    // Handler to call refetch after create/update
    const handleFormSuccess = () => {
        setOpen(false);
        setEditData(null);
        refetch();
    };

    React.useEffect(() => {
        refetch();
    }, [selectedOrganization]);



    return (
        <div className="flex h-full w-full flex-col items-start gap-4 px-12 py-12">
            {regions.length > 0 && <><div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                    Regions
                </span>
                <span className="text-body font-body text-subtext-color">
                    Overview of your store&#39;s performance and customer engagement
                </span>
            </div>
                <div className="flex w-full items-center justify-between">
                    <span className="text-caption font-caption text-subtext-color">
                        Showing {regions.length ?? 0} records
                    </span>
                    <Button
                        variant=""
                        icon={<FeatherPlus />}
                        onClick={() => { setOpen(true); setEditData(null); }}
                    >
                        Add Region
                    </Button>
                </div> </>}
            <div className="w-full flex-col items-start gap-2 grid md:grid-cols-2 lg:grid-cols-3">
                {regions && regions.map(region => (
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
            {!loading && regions.length === 0 && (
                <div className="w-full h-full flex items-center justify-center bg-background">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                        
                        <h2 className="text-heading-2 font-heading-2 text-default-font">No Regions Found</h2>
                        <p className="text-body font-body text-subtext-color">You do not have any regions added yet. Start by adding a new region.</p>
                        <Button
                            variant=""
                            icon={<FeatherPlus />}
                            onClick={() => { setOpen(true); setEditData(null); }}
                            className="mt-4"
                        >
                            Add Region
                        </Button>
                    </div>
                </div>
            )}
            <Dialog open={open} onOpenChange={(open: boolean) => { setOpen(open); if (!open) setEditData(null); }}>
                <Dialog.Content>
                    <CreateRegionForm
                        region={editData}
                        onSuccess={handleFormSuccess}
                        onCancel={() => { setOpen(false); setEditData(null); }}
                        organizationId={selectedOrganization ? selectedOrganization.id : ""}
                    />
                </Dialog.Content>
            </Dialog>
        </div>
    )
};