import { useOrganizationStore } from "@/store/useOrganizationStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { isSuperAdmin } from "@/utils/customerType";
import { supabase } from "@/supabaseClient";
import { ILoggedUser, userCrud } from "@/types/IUser";
import { Button } from "@/ui/components/Button";
import { CreateUserForm2 } from "@/ui/components/CreateUserForm2";
import { Drawer } from "@/ui/components/Drawer";
import { UsersTable } from "@/ui/components/UsersTable";
import { FeatherPlus, FeatherRefreshCw, FeatherUsers } from "@subframe/core";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { sortByLatestCreated } from "@/utils/dateUtils";

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const { selectedOrganization } = useOrganizationStore();
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const isSuper = isSuperAdmin(loggedInUser);
  const [editData, setEditData] = useState<ILoggedUser | null>(null);

  const { useList, useDelete } = userCrud;

  const targetOrgId = isSuper
    ? selectedOrganization?.id
    : loggedInUser?.organization?.id || loggedInUser?.organization_id;

  const {
    data,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useList({
    filters: targetOrgId
      ? { organization_id: targetOrgId, deleted: false }
      : { deleted: false },
    orderBy: { column: "created_at", ascending: false },
    skip: !targetOrgId,
    custom(query) {
      return query.select(
        ` *,
        region:region_id (*),
        organization:organization_id (*),
        depot:depot_id (*),
        role:role_id (*)
      `
      );
    },
  });

  const { mutate: deleteMutate } = useDelete();

  const rawUsers = data ? (data.data as ILoggedUser[]) : ([] as ILoggedUser[]);

  // Filter strictly to STU users in this organization (sorted by latest created date)
  const stuUsers = useMemo(() => {
    const list = rawUsers.filter(
      (u) =>
        u.customer_type !== "regular" &&
        u.role?.name?.toLowerCase() !== "user"
    );
    return sortByLatestCreated(list);
  }, [rawUsers]);

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
    <div className="flex h-full overflow-hidden w-full flex-col items-start gap-4">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-2 font-heading-2 text-default-font">
          STU Users
        </span>
        <span className="text-body font-body text-subtext-color">
          {selectedOrganization?.name
            ? `Manage staff accounts, roles, and depot permissions for ${selectedOrganization.name}`
            : "Manage organization staff accounts, roles, and depot permissions"}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-caption font-caption text-subtext-color">
            Showing {stuUsers.length} staff member{stuUsers.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="neutral-primary"
            className="flex-1 sm:flex-none"
            icon={<FeatherRefreshCw />}
            onClick={() => {
              toast.success("Users refreshed successfully");
              refetch();
            }}
          >
            Refresh
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            icon={<FeatherPlus />}
            onClick={() => {
              setOpen(true);
              setEditData(null);
            }}
          >
            Add STU User
          </Button>
        </div>
      </div>
      {stuUsers && stuUsers.length > 0 ? (
        <UsersTable
          users={stuUsers}
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
              {selectedOrganization?.name
                ? `No STU staff members found for "${selectedOrganization.name}". Start by adding an STU user.`
                : "No organization selected or no users found. Start by adding an STU user."}
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
            fixedTier="stu"
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
