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
import { FeatherCheck } from "@subframe/core";
import { FeatherEdit2 } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherShieldCheck } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Badge } from "./Badge";
import { DropdownMenu } from "./DropdownMenu";
import { IconButton } from "./IconButton";
import { Table } from "./Table";
import { UserDetails } from "@/api/users/types";
import { OptionsDropdown } from "./OptionsDropdown";

interface UsersTableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  users: UserDetails[];
}

const UsersTableRoot = React.forwardRef<HTMLDivElement, UsersTableRootProps>(
  function UsersTableRoot(
    { className, users, ...otherProps }: UsersTableRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-2  rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <Table
          header={
            <Table.HeaderRow>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Password</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Region</Table.HeaderCell>
              <Table.HeaderCell>Organization</Table.HeaderCell>
              <Table.HeaderCell>Depot</Table.HeaderCell>
              <Table.HeaderCell>Active</Table.HeaderCell>
              <Table.HeaderCell>Created At</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.HeaderRow>
          }
        >
          {users.map((user) => <Table.Row key={user.userId}>
            <Table.Cell>
              <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                {user.email}
              </span>
            </Table.Cell>
            <Table.Cell>
              <span className="whitespace-nowrap text-body font-body text-subtext-color">
                {user.password}
              </span>
            </Table.Cell>
            <Table.Cell>
              <Badge className="capitalize" variant="error" icon={<FeatherShieldCheck />}>
                {user.role?.name.split("_").join(" ") || "—"}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <span className="whitespace-nowrap text-body font-body text-default-font text-subtext-color">
                {user.region?.name || "—"}
              </span>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-body font-body text-default-font text-subtext-color">
                  {user.organization?.name || "—"}
                </span>
              </div>
            </Table.Cell>
            <Table.Cell>
              <span className="whitespace-nowrap text-body font-body text-subtext-color ">
                {user.depot?.name || "—"}
              </span>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={user.active ? "success" : "error"} icon={<FeatherCheck />}>{user.active ? "Active" : "Inactive"}</Badge>
            </Table.Cell>
            <Table.Cell>
              <span className="whitespace-nowrap text-body font-body text-subtext-color">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </span>
            </Table.Cell>
            <Table.Cell>
              <div className="flex grow shrink-0 basis-0 items-center justify-end">
                <OptionsDropdown />
              </div>
            </Table.Cell>
          </Table.Row>)}
        </Table>
      </div>
    );
  }
);

export const UsersTable = UsersTableRoot;
