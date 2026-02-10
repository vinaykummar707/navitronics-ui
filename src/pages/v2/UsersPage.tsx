import { useUsersByOrganization } from "@/api/users/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { supabase } from "@/supabaseClient";
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


    // write a function to soft delete a user by setting deleted to true and active to false, and then refetch the users list using supabase client, and also handle any errors that may occur during the process
    const handleDeleteUser = async (userId: string) => {
        try {
            // use supabase client to update the user with the given userId, set deleted to true and active to false
            const { data, error } = await supabase
                .from("users")
                .update({ deleted: true, active: false })
                .eq("user_id", userId);
            if (error) {
                throw error;
            }
            refetch();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

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
                    variant=""
                    icon={<FeatherPlus />}
                    onClick={() => { setOpen(true); setEditData(null); }}
                >
                    Add User
                </Button>
            </div>
            <UsersTable users={usersData?.users || []} onDeleteUser={handleDeleteUser} onEditUser={(user) => { setEditData(user); setOpen(true); }} />
            <Drawer open={open} onOpenChange={(open: boolean) => { setOpen(open); if (!open) setEditData(null); }}>
                <Drawer.Content>
                    <CreateUserForm2 onCancel={() => setOpen(false)} initialData={editData}  onUserCreated={() => {setOpen(false); refetch(); }} />
                </Drawer.Content>
            </Drawer>
        </div>
    );
}