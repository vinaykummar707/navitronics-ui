import React, { useMemo, useState } from "react";
import { userCrud, ILoggedUser } from "@/types/IUser";
import { Button } from "@/ui/components/Button";
import { Drawer } from "@/ui/components/Drawer";
import { CreateGuestDrawer } from "@/ui/components/CreateGuestDrawer";
import { UsersTable } from "@/ui/components/UsersTable";
import { FeatherPlus, FeatherRefreshCw, FeatherUserCheck } from "@subframe/core";
import { toast } from "react-toastify";
import { sortByLatestCreated } from "@/utils/dateUtils";

const GUEST_ROLE_ID = "3fd42bb4-31fd-4f27-9fe9-f2dbb2d77b6c";

export default function GuestsPage() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<ILoggedUser | null>(null);

  const { useList, useDelete } = userCrud;

  const {
    data,
    isLoading: loading,
    refetch,
  } = useList({
    filters: { role_id: GUEST_ROLE_ID },
    orderBy: { column: "created_at", ascending: false },
    custom(query) {
      return query.select(
        ` *,
        role:role_id (*)
      `
      );
    },
  });

  const { mutate: deleteMutate } = useDelete();

  const rawUsers = data ? (data.data as ILoggedUser[]) : ([] as ILoggedUser[]);
  const guests = useMemo(() => {
    return sortByLatestCreated(rawUsers);
  }, [rawUsers]);

  const handleDeleteGuest = (userId: string) => {
    deleteMutate(userId, {
      onSuccess: () => {
        toast.success("Guest user deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        toast.error(`Failed to delete guest: ${error.message || "Unknown error"}`);
        console.error("Error deleting guest:", error);
      },
    });
  };

  return (
    <div className="flex h-full overflow-hidden w-full flex-col items-start gap-4">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Guest Users
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage view-only guest accounts with read-only access across the entire hierarchy
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-caption font-caption text-subtext-color">
            Showing {guests.length} guest account{guests.length === 1 ? "" : "s"}
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
                toast.success("Guests refreshed successfully");
              } catch (err: any) {
                toast.error(`Failed to refresh guests: ${err.message || "Unknown error"}`);
              }
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
            Add Guest User
          </Button>
        </div>
      </div>

      {guests && guests.length > 0 ? (
        <UsersTable
          users={guests}
          onDeleteUser={(id) => {
            if (
              confirm(
                "Are you sure you want to delete this guest user? This action cannot be undone."
              )
            ) {
              handleDeleteGuest(id);
            }
          }}
          onEditUser={(user) => {
            setEditData(user);
            setOpen(true);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-primary border border-brand-primary/20">
              <FeatherUserCheck className="h-6 w-6" />
            </div>
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              No Guest Users Found
            </h2>
            <p className="text-body font-body text-subtext-color">
              Guest users have view-only access across the entire hierarchy. Start by adding a new guest user.
            </p>
            <Button
              className="mt-2"
              icon={<FeatherPlus />}
              onClick={() => {
                setOpen(true);
                setEditData(null);
              }}
            >
              Add Guest User
            </Button>
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
          <CreateGuestDrawer
            initialData={editData}
            onCancel={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false);
              refetch();
            }}
          />
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
