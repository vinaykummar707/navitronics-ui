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
import { confirmUserDelete } from "@/utils/deleteImpact";
import RBAC from "@/components/RBAC";

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const { selectedOrganization } = useOrganizationStore();
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const isSuper = isSuperAdmin(loggedInUser);
  const [editData, setEditData] = useState<ILoggedUser | null>(null);

  const { useList, useDelete } = userCrud;

  const userRole = loggedInUser?.role?.name?.toLowerCase();

  const userFilters = useMemo(() => {
    const f: Record<string, any> = {};
    if (isSuper) {
      if (selectedOrganization?.id) {
        f.organization_id = selectedOrganization.id;
      }
    } else if (userRole === "depot_admin") {
      const depotId = loggedInUser?.depot_id || loggedInUser?.depot?.id;
      if (depotId) f.depot_id = depotId;
    } else if (userRole === "region_admin") {
      const regionId = loggedInUser?.region_id || loggedInUser?.region?.id;
      if (regionId) f.region_id = regionId;
    } else {
      const orgId = loggedInUser?.organization?.id || loggedInUser?.organization_id || selectedOrganization?.id;
      if (orgId) f.organization_id = orgId;
    }
    return f;
  }, [isSuper, userRole, selectedOrganization?.id, loggedInUser]);

  const shouldSkip = isSuper ? !selectedOrganization?.id : Object.keys(userFilters).length === 0;

  const {
    data,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useList({
    filters: userFilters,
    orderBy: { column: "created_at", ascending: false },
    skip: shouldSkip,
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

  // Filter strictly to STU users in this organization (sorted by latest created date), excluding logged-in self user
  const stuUsers = useMemo(() => {
    const list = rawUsers.filter(
      (u) =>
        u.customer_type !== "regular" &&
        u.role?.name?.toLowerCase() !== "user" &&
        u.id !== loggedInUser?.id &&
        u.user_id !== loggedInUser?.user_id &&
        u.email?.toLowerCase() !== loggedInUser?.email?.toLowerCase()
    );
    return sortByLatestCreated(list);
  }, [rawUsers, loggedInUser]);

  // Delete a user
  const handleDeleteUser = (userId: string) => {
    setEditData(null);
    deleteMutate(userId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setEditData(null);
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Failed to delete user: ${error.message || "Unknown error"}`);
        console.error("Error deleting user:", error);
      },
    });
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
            onClick={async () => {
              try {
                await refetch();
                toast.success("Users refreshed successfully");
              } catch (err: any) {
                toast.error(`Failed to refresh users: ${err.message || "Unknown error"}`);
              }
            }}
          >
            Refresh
          </Button>
          <RBAC features={[]} roles={["master", "organization_admin", "region_admin", "depot_admin"]}>
            <Button
              className="flex-1 sm:flex-none"
              icon={<FeatherPlus />}
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              Add User
            </Button>
          </RBAC>
        </div>
      </div>
      {stuUsers && stuUsers.length > 0 ? (
        <UsersTable
          users={stuUsers}
          onDeleteUser={async (id) => {
            const target = stuUsers.find((u) => u.id === id);
            if (await confirmUserDelete(target?.user_id || target?.id)) {
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
        onOpenChange={(isOpen: boolean) => {
          setOpen(isOpen);
          if (!isOpen) setEditData(null);
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
            key={editData?.id || editData?.user_id || "create-new-stu-user"}
            fixedTier="stu"
            onCancel={() => {
              setOpen(false);
              setEditData(null);
            }}
            initialData={editData}
            onUserCreated={() => {
              setOpen(false);
              setEditData(null);
              refetch();
            }}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
