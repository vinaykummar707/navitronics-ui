"use client";

import React, { useMemo, useState } from "react";
import {
  FeatherCheck,
  FeatherEdit2,
  FeatherLayers,
  FeatherPlus,
  FeatherRefreshCw,
  FeatherSearch,
  FeatherTrash,
  FeatherUser,
  FeatherUsers,
  FeatherX,
} from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Table } from "@/ui/components/Table";
import { Badge } from "@/ui/components/Badge";
import { TextField } from "@/ui/components/TextField";
import { CreateRegularCustomerDrawer } from "@/ui/components/CreateRegularCustomerDrawer";
import { userCrud, ILoggedUser } from "@/types/IUser";
import { supabase } from "@/supabaseClient";
import { toast } from "react-toastify";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { isSuperAdmin } from "@/utils/customerType";
import { PasswordViewerCell } from "@/ui/components/PasswordViewerCell";
import { formatDate, sortByLatestCreated } from "@/utils/dateUtils";

export default function RegularCustomersPage() {
  const loggedInUser = useLoggedUserStore((state) => state.user);
  const isSuper = isSuperAdmin(loggedInUser);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ILoggedUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { useList } = userCrud;
  const { data, isLoading, refetch } = useList({
    filters: { deleted: false },
    custom(query) {
      return query
        .select(
          `*,
          role:role_id (*)
        `
        )
        .or("customer_type.eq.regular,role_id.eq.fd72d0e0-831e-494c-96a5-3e153ab3e2db,organization_id.is.null");
    },
    orderBy: { column: "created_at", ascending: false },
  });

  const rawUsers = data ? (data.data as ILoggedUser[]) : ([] as ILoggedUser[]);

  // Filter strictly to regular customers (sorted by latest created date)
  const regularCustomers = useMemo(() => {
    const list = rawUsers.filter(
      (u) =>
        u.customer_type === "regular" ||
        u.role?.name?.toLowerCase() === "user" ||
        !u.organization_id
    );
    return sortByLatestCreated(list);
  }, [rawUsers]);

  // Apply search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return regularCustomers;
    const q = searchQuery.toLowerCase().trim();
    return regularCustomers.filter((u) =>
      u.email.toLowerCase().includes(q)
    );
  }, [regularCustomers, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = regularCustomers.length;
    const active = regularCustomers.filter((u) => u.active).length;
    const v1Enabled = regularCustomers.filter((u) => u.v1_routes).length;
    const v2Enabled = regularCustomers.filter((u) => u.v2_routes).length;
    return { total, active, v1Enabled, v2Enabled };
  }, [regularCustomers]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to deactivate regular customer "${email}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from("users")
        .update({ deleted: true, active: false })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Customer ${email} removed successfully`);
      refetch();
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start gap-5 overflow-hidden">
      {/* Header */}
      <div className="flex w-full flex-col items-start gap-1">
        <span className="text-heading-2 font-heading-2 text-default-font">
          Regular Customers
        </span>
        <span className="text-body font-body text-subtext-color">
          Manage standalone customer accounts, login status, and format permissions
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <span className="text-caption font-caption text-subtext-color">
            Total Customers
          </span>
          <span className="text-heading-2 font-heading-2 font-bold text-default-font">
            {metrics.total}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <span className="text-caption font-caption text-subtext-color">
            Active Accounts
          </span>
          <span className="text-heading-2 font-heading-2 font-bold text-emerald-600">
            {metrics.active}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <span className="text-caption font-caption text-subtext-color">
            V1 Format Enabled
          </span>
          <span className="text-heading-2 font-heading-2 font-bold text-amber-600">
            {metrics.v1Enabled}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-border bg-sidebar-background p-4 shadow-xs">
          <span className="text-caption font-caption text-subtext-color">
            V2 Format Enabled
          </span>
          <span className="text-heading-2 font-heading-2 font-bold text-brand-primary">
            {metrics.v2Enabled}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <TextField
            className="w-full h-9"
            icon={<FeatherSearch />}
          >
            <TextField.Input
              placeholder="Search by customer email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </TextField>
          <span className="text-caption font-caption text-subtext-color shrink-0">
            Showing {filteredCustomers.length} of {regularCustomers.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="neutral-primary"
            className="h-9"
            icon={<FeatherRefreshCw />}
            onClick={() => {
              toast.success("Customer list refreshed");
              refetch();
            }}
          >
            Refresh
          </Button>
          <Button
            className="h-9"
            icon={<FeatherPlus />}
            onClick={() => {
              setEditingCustomer(null);
              setIsDrawerOpen(true);
            }}
          >
            Add Regular Customer
          </Button>
        </div>
      </div>

      {/* Content Table */}
      {filteredCustomers.length > 0 ? (
        <div className="flex w-full flex-col overflow-x-auto touch-scroll-x rounded-lg border border-neutral-border bg-sidebar-background shadow-xs">
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell>Customer Email</Table.HeaderCell>
                {isSuper && <Table.HeaderCell className="min-w-[140px]">Password</Table.HeaderCell>}
                <Table.HeaderCell>Account Type</Table.HeaderCell>
                <Table.HeaderCell>Version</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Joined Date</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
              </Table.HeaderRow>
            }
          >
            {filteredCustomers.map((customer) => (
              <Table.Row key={customer.id}>
                {/* Email */}
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-primary font-semibold text-xs shrink-0">
                      {customer.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-bold font-body-bold text-default-font">
                        {customer.email}
                      </span>
                      <span className="text-[11px] text-subtext-color">
                        Standalone Route Creator
                      </span>
                    </div>
                  </div>
                </Table.Cell>

                {/* Password (Super Admin Only) */}
                {isSuper && (
                  <Table.Cell className="min-w-[140px]">
                    <PasswordViewerCell password={customer.password} />
                  </Table.Cell>
                )}

                {/* Account Type */}
                <Table.Cell>
                  <Badge variant="brand">Regular Customer</Badge>
                </Table.Cell>

                {/* Route Formats */}
                <Table.Cell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {customer.v1_routes && (
                      <Badge variant="warning" className="text-[11px]">
                        V1
                      </Badge>
                    )}
                    {customer.v2_routes && (
                      <Badge variant="neutral" className="text-[11px]">
                        V2
                      </Badge>
                    )}
                    {!customer.v1_routes && !customer.v2_routes && (
                      <span className="text-caption text-subtext-color">None</span>
                    )}
                  </div>
                </Table.Cell>

                {/* Status */}
                <Table.Cell>
                  {customer.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="error">Inactive</Badge>
                  )}
                </Table.Cell>

                {/* Joined Date */}
                <Table.Cell>
                  <span className="text-caption font-caption text-subtext-color">
                    {formatDate(customer.created_at)}
                  </span>
                </Table.Cell>

                {/* Actions */}
                <Table.Cell>
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      size="small"
                      variant="neutral-tertiary"
                      icon={<FeatherEdit2 />}
                      title="Edit Customer"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsDrawerOpen(true);
                      }}
                    />
                    <IconButton
                      size="small"
                      variant="destructive-tertiary"
                      icon={<FeatherTrash />}
                      title="Deactivate Customer"
                      onClick={() => handleDelete(customer.id, customer.email)}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>
        </div>
      ) : (
        <div className="flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-border bg-sidebar-background p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-subtext-color">
            <FeatherUsers className="h-6 w-6" />
          </div>
          <span className="text-heading-3 font-heading-3 text-default-font">
            {searchQuery ? "No matching regular customers" : "No regular customers yet"}
          </span>
          <span className="text-body font-body text-subtext-color text-center max-w-sm">
            {searchQuery
              ? `No customers found matching "${searchQuery}". Try a different search term.`
              : "Create standalone customer accounts to let freelancers and bodybuilders create routes."}
          </span>
          {!searchQuery && (
            <Button
              className="mt-2"
              icon={<FeatherPlus />}
              onClick={() => {
                setEditingCustomer(null);
                setIsDrawerOpen(true);
              }}
            >
              Add Regular Customer
            </Button>
          )}
        </div>
      )}

      {/* Drawer */}
      <CreateRegularCustomerDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={() => {
          refetch();
        }}
        initialData={editingCustomer}
      />
    </div>
  );
}
