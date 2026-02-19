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

            // delete the user from the auth.users table as well
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);
            if (authError) {
                throw authError;
            }
            console.log("User successfully deleted.");
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
            {usersData && usersData.users.length > 0 ? (<UsersTable users={usersData?.users || []} onDeleteUser={handleDeleteUser} onEditUser={(user) => { setEditData(user); setOpen(true); }} />): <div className="w-full h-full flex items-center justify-center bg-background">
                                <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                                    
                                    <h2 className="text-heading-2 font-heading-2 text-default-font">No Users Found</h2>
                                    <p className="text-body font-body text-subtext-color">You do not have any users added yet. Start by adding a new user.</p>
                                    
                                </div>
                            </div>}
            <Drawer open={open} onOpenChange={(open: boolean) => { setOpen(open); if (!open) setEditData(null); }}>
                <Drawer.Content>
                    <CreateUserForm2 onCancel={() => setOpen(false)} initialData={editData}  onUserCreated={() => {setOpen(false); refetch(); }} />
                </Drawer.Content>
            </Drawer>
        </div>
    );
}