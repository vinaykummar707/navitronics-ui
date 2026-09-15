import { useOrganizationStore } from "@/store/useOrganizationStore";
import { supabase } from "@/supabaseClient";
import { ILoggedUser, userCrud } from "@/types/IUser";
import { Button } from "@/ui/components/Button";
import { CreateUserForm2 } from "@/ui/components/CreateUserForm2";
import { Drawer } from "@/ui/components/Drawer";
import { UsersTable } from "@/ui/components/UsersTable";
import { FeatherPlus, FeatherRefreshCw } from "@subframe/core";
import { useState } from "react";
import { toast } from "react-toastify";

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const { selectedOrganization } = useOrganizationStore();
  const [editData, setEditData] = useState<ILoggedUser>(null);

  const { useList, useDelete } = userCrud;

  const {
    data,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useList({
    filters: { organization_id: selectedOrganization?.id, deleted: false },
    skip: !selectedOrganization?.id,
    custom(query) {
      return query.select(
        ` *,
        region:region_id (*),
        organization:organization_id (*),
        depot:depot_id (*),
        role:role_id (*)
      `,
      );
    },
  });

  const { mutate: deleteMutate } = useDelete();

  const usersData = data ? (data.data as ILoggedUser[]) : ([] as ILoggedUser[]);

  // Soft delete a user by setting deleted to true and active to false
  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ deleted: true, active: false })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(`Failed to delete user: ${error.message}`);
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="flex h-full  overflow-hidden w-full flex-col items-start gap-4 ">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-2 font-heading-2 text-default-font text-center">
          Users
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage user accounts, roles, and route access permissions
        </span>
      </div>
      <div className="flex w-full items-center justify-between mobile:flex-col mobile:items-start gap-4">
        <span className="text-caption font-caption text-subtext-color">
          Showing {usersData?.length || 0} records
        </span>
        <div className="flex justify-end items-center col-span-4 gap-2">
          <Button
            variant="neutral-secondary"
            className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
            icon={<FeatherRefreshCw />}
            onClick={() => {
              toast.success("Users refreshed successfully");
              refetch();
            }}
          >
            Refresh
          </Button>
          <Button
            icon={<FeatherPlus />}
            onClick={() => {
              setOpen(true);
              setEditData(null);
            }}
          >
            Add User
          </Button>
        </div>
      </div>
      {usersData && usersData.length > 0 ? (
        <UsersTable
          users={usersData || []}
          onDeleteUser={(id) => {
            if (
              confirm(
                "Are you sure you want to delete this user? This action cannot be undone.",
              )
            ) {
              handleDeleteUser(id);
            }
          }}
          onEditUser={(user) => {
            setEditData(user);
            setOpen(true);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Users Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              You do not have any users added yet. Start by adding a new user.
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
        <Drawer.Content
          onPointerDownOutside={(event) => {
              event.preventDefault();
              
          }}
          onInteractOutside={(event) => {
            
              event.preventDefault();
              
          }}
        >
          <CreateUserForm2
            onCancel={() => setOpen(false)}
            initialData={editData}
            onUserCreated={() => {
              setOpen(false);
              refetch();
            }}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
