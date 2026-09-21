"use client";
/*
 * Documentation:
 * Badge — https://app.subframe.com/11b10bc240cf/library?component=Badge_97bdb082-1124-4dd7-a335-b14b822d0157
 * Dropdown Menu — https://app.subframe.com/11b10bc240cf/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Table — https://app.subframe.com/11b10bc240cf/library?component=Table_142dfde7-d0cc-48a1-a04c-a08ab2252633
 * UsersTable — https://app.subframe.com/11b10bc240cf/library?component=UsersTable_c08bbd0e-0c53-41cd-9e0a-b25e36ede8a3
 */

import React from "react";
import {
  FeatherCheck,
  FeatherEdit2,
  FeatherLayers,
  FeatherMoreHorizontal,
  FeatherShieldCheck,
  FeatherTag,
  FeatherTrash,
  FeatherX,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Badge } from "./Badge";
import { DropdownMenu } from "./DropdownMenu";
import { IconButton } from "./IconButton";
import { Table } from "./Table";
import { OptionsDropdown } from "./OptionsDropdown";
import { ILoggedUser, IUser } from "@/types/IUser";
import { toast } from "react-toastify";
import { getUserRouteAccess } from "@/utils/featureFlags";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { isSuperAdmin } from "@/utils/customerType";
import { PasswordViewerCell } from "./PasswordViewerCell";
import { formatDate } from "@/utils/dateUtils";

interface UsersTableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  users: ILoggedUser[];
  onEditUser?: (user: ILoggedUser) => void;
  onDeleteUser?: (userId: string) => void;
}

const UsersTableRoot = React.forwardRef<HTMLDivElement, UsersTableRootProps>(
  function UsersTableRoot(
    { className, users, onEditUser, onDeleteUser, ...otherProps }: UsersTableRootProps,
    ref
  ) {
    const loggedInUser = useLoggedUserStore((state) => state.user);
    const isSuperAdminUser = isSuperAdmin(loggedInUser);
    const formatCreatedAt = (dateStr?: string | null) => {
      return formatDate(dateStr);
    };

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-2 overflow-x-auto touch-scroll-x rounded-md border border-solid border-neutral-border bg-sidebar-background shadow-xs px-3 sm:px-4 py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <Table
          className="touch-scroll-x"
          header={
            <Table.HeaderRow>
              <Table.HeaderCell className="min-w-[140px]">Email</Table.HeaderCell>
              {isSuperAdminUser && (
                <Table.HeaderCell className="min-w-[140px]">Password</Table.HeaderCell>
              )}
              <Table.HeaderCell className="min-w-[130px] justify-center text-center">Role</Table.HeaderCell>
              <Table.HeaderCell className="hidden sm:table-cell min-w-[110px] justify-center text-center">Route Access</Table.HeaderCell>
              <Table.HeaderCell className="hidden md:table-cell min-w-[100px]">Region</Table.HeaderCell>
              <Table.HeaderCell className="hidden lg:table-cell min-w-[120px]">Organization</Table.HeaderCell>
              <Table.HeaderCell className="hidden md:table-cell min-w-[100px]">Depot</Table.HeaderCell>
              <Table.HeaderCell className="min-w-[90px] justify-center text-center">Active</Table.HeaderCell>
              <Table.HeaderCell className="hidden xl:table-cell justify-center text-center min-w-[120px]">Created At</Table.HeaderCell>
              <Table.HeaderCell className="w-12 justify-end" />
            </Table.HeaderRow>
          }
        >
          {users.map((user: ILoggedUser) => {
            const routeAccess = getUserRouteAccess(user);
            const isRowMaster = user.role?.name === "master";

            return (
              <Table.Row key={user.id || user.user_id}>
                <Table.Cell className="min-w-[140px]">
                  <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                    {user.email}
                  </span>
                </Table.Cell>
                {isSuperAdminUser && (
                  <Table.Cell className="min-w-[140px]">
                    <PasswordViewerCell password={user.password} />
                  </Table.Cell>
                )}
                <Table.Cell className="min-w-[130px] justify-center text-center">
                  <Badge className="capitalize" variant="brand" icon={<FeatherShieldCheck className="h-3 w-3" />}>
                    {user.role?.name === "master"
                      ? "Super Admin"
                      : user.role?.name
                      ? user.role.name.split("_").join(" ")
                      : "—"}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="hidden sm:table-cell min-w-[110px] justify-center text-center">
                  {isRowMaster || routeAccess.isDualUser ? (
                    <Badge variant="brand" icon={<FeatherLayers className="h-3 w-3" />}>V1 + V2</Badge>
                  ) : routeAccess.isV1Only ? (
                    <Badge variant="warning" icon={<FeatherTag className="h-3 w-3" />}>V1 Only</Badge>
                  ) : (
                    <Badge variant="neutral" icon={<FeatherTag className="h-3 w-3" />}>V2 Only</Badge>
                  )}
                </Table.Cell>
                <Table.Cell className="hidden md:table-cell min-w-[100px]">
                  <span className="whitespace-nowrap text-body font-body text-default-font text-subtext-color">
                    {user.region?.name || "—"}
                  </span>
                </Table.Cell>
                <Table.Cell className="hidden lg:table-cell min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-body font-body text-default-font text-subtext-color">
                      {user.organization?.name || "—"}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="hidden md:table-cell min-w-[100px]">
                  <span className="whitespace-nowrap text-body font-body text-subtext-color ">
                    {user.depot?.name || "—"}
                  </span>
                </Table.Cell>
                <Table.Cell className="min-w-[90px] justify-center text-center">
                  <Badge
                    variant={user.active ? "success" : "error"}
                    icon={user.active ? <FeatherCheck className="h-3 w-3" /> : <FeatherX className="h-3 w-3" />}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="hidden xl:table-cell justify-center text-center min-w-[120px]">
                  <span className="whitespace-nowrap text-body font-body text-neutral-500">
                    {formatCreatedAt(user.created_at)}
                  </span>
                </Table.Cell>
                <Table.Cell className="w-12 justify-end">
                  <div className="flex grow shrink-0 basis-0 items-center justify-end">
                    <OptionsDropdown
                      isDisabled={user.role?.name === "master"}
                      onDelete={() => onDeleteUser && onDeleteUser(user.id)}
                      onEdit={() => onEditUser && onEditUser(user)}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table>
      </div>
    );
  }
);

export const UsersTable = UsersTableRoot;
