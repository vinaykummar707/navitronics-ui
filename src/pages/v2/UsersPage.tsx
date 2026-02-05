import { useUsersByOrganization } from "@/api/users/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { Button } from "@/ui/components/Button";
import { CreateUserForm2 } from "@/ui/components/CreateUserForm2";
import { Drawer } from "@/ui/components/Drawer";
import { UsersTable } from "@/ui/components/UsersTable";
import { FeatherPlus } from "@subframe/core";
import { useState } from "react";

export default function UsersPage() {
    const [open, setOpen] = useState(false);
    const { selectedOrganization } = useOrganizationStore();
    const [editData, setEditData] = useState<any>(null);

    const { data: usersData, loading: usersLoading, error: usersError, refetch } = useUsersByOrganization(selectedOrganization?.id || "");

    return (
        <div className="flex h-full w-full flex-col items-start gap-4 px-12 py-12">
            <div className="flex w-full flex-col items-start gap-1">
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                    Users
                </span>
                <span className="text-body font-body text-subtext-color">
                    Overview of your store&#39;s performance and customer engagement
                </span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-caption font-caption text-subtext-color">
                    Showing {usersData?.users.length || 0}  records
                </span>
                <Button
                    variant="brand-secondary-2"
                    icon={<FeatherPlus />}
                    onClick={() => { setOpen(true); setEditData(null); }}
                >
                    Add User
                </Button>
            </div>
            <UsersTable users={usersData?.users || []} />
            <Drawer open={open} onOpenChange={(open: boolean) => { setOpen(open); if (!open) setEditData(null); }}>
                <Drawer.Content>
                    <CreateUserForm2 onUserCreated={() => {setOpen(false); refetch(); }} />
                </Drawer.Content>
            </Drawer>
        </div>
    );
}