"use client";
/*
 * Documentation:
 * RouteTable — https://app.subframe.com/11b10bc240cf/library?component=RouteTable_f16f219d-dc63-4448-b305-8e26aee5b85e
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Table } from "./Table";
import { Badge } from "./Badge";
import { IconButton } from "./IconButton";
import { DropdownMenu } from "./DropdownMenu";
import {
  FeatherCheck,
  FeatherEdit2,
  FeatherMoreHorizontal,
  FeatherTag,
  FeatherX,
} from "@subframe/core";
import { DisplayConfigGetRequest } from "@/types/routeConfigV2";
import { IRoute } from "@/types/IRoute";
import { Checkbox } from "./Checkbox";
import Avvvatars from "avvvatars-react";

interface RouteTableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  routes?: IRoute[]; // Replace 'any' with your actual route type
  className?: string;
  onEdit?: (routeId: string) => void; // Callback for edit action
  onDelete?: (routeId: string) => void; // Callback for delete action
  onDuplicate?: (routeId: string, suffix: string) => void; // Callback for duplicate action
  onReturn?: (routeId: string, suffix: string) => void; // Callback for duplicate action
  selectedRouteIds?: string[]; // Array of selected route IDs for checkbox state
  onSelectedChange?: (routeId: string, selected: boolean) => void; // Callback for checkbox state change
  onSelectAllChange?: (checked: boolean) => void; // Atomic callback for select all
}

const RouteTableRoot = React.forwardRef<HTMLDivElement, RouteTableRootProps>(
  function RouteTableRoot(
    {
      children,
      routes,
      className,
      selectedRouteIds,
      onSelectedChange,
      onSelectAllChange,
      onEdit,
      onDelete,
      onDuplicate,
      onReturn,
      ...otherProps
    }: RouteTableRootProps,
    ref,
  ) {
    const selectedSet = React.useMemo(
      () => new Set(selectedRouteIds || []),
      [selectedRouteIds]
    );

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex flex-col overflow-auto w-full items-start gap-6 rounded-md border border-solid border-neutral-border bg-sidebar-background px-4 py-4 shadow-xs",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
        <Table
          className="overflow-auto touch-scroll-x"
          header={
            <Table.HeaderRow>
              <Table.HeaderCell className="w-10">
                <Checkbox
                  label=""
                  checked={
                    routes && routes.length > 0 && selectedRouteIds
                      ? selectedRouteIds.length === routes.length
                      : false
                  }
                  onCheckedChange={(checked: boolean) => {
                    if (onSelectAllChange) {
                      onSelectAllChange(checked);
                    } else {
                      routes?.forEach((route) => {
                        onSelectedChange?.(route.id, checked);
                      });
                    }
                  }}
                />
              </Table.HeaderCell>
              <Table.HeaderCell className="min-w-[100px]">Route No</Table.HeaderCell>
              <Table.HeaderCell className="min-w-[120px]">Source</Table.HeaderCell>
              <Table.HeaderCell className="min-w-[120px]">Destination</Table.HeaderCell>
              <Table.HeaderCell className="hidden md:table-cell min-w-[110px] justify-center text-center">Split Route</Table.HeaderCell>
              <Table.HeaderCell className="hidden md:table-cell min-w-[90px] justify-center text-center">Return</Table.HeaderCell>
              <Table.HeaderCell className="hidden sm:table-cell min-w-[90px] justify-center text-center">Version</Table.HeaderCell>
              <Table.HeaderCell className="hidden lg:table-cell min-w-[110px]">Created At</Table.HeaderCell>
              <Table.HeaderCell className="hidden xl:table-cell min-w-[140px]">Created By</Table.HeaderCell>
              <Table.HeaderCell className="w-12 justify-end" />
            </Table.HeaderRow>
          }
        >
          {routes?.map((route: IRoute) => (
            <Table.Row key={route.id}>
              <Table.Cell className="w-10">
                <Checkbox
                  label=""
                  checked={selectedSet.has(route.id)}
                  onCheckedChange={(checked: boolean) => {
                    onSelectedChange?.(route.id, checked);
                  }}
                />
              </Table.Cell>
              <Table.Cell className="min-w-[100px]">
                <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                  {!route.is_split_route
                    ? `${route.route_number}`
                    : `${route.route_number_1} - ${route.route_number_2}`}
                </span>
              </Table.Cell>
              <Table.Cell className="min-w-[120px]">
                <span className="whitespace-nowrap text-body font-body text-neutral-500">
                  {route.source}
                </span>
              </Table.Cell>
              <Table.Cell className="min-w-[120px]">
                <span className="whitespace-nowrap text-body font-body text-neutral-500">
                  {route.destination}
                </span>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell min-w-[110px] justify-center text-center">
                <Badge
                  variant={route.is_split_route ? "brand" : "neutral"}
                  icon={route.is_split_route ? <FeatherCheck className="h-3 w-3" /> : <FeatherX className="h-3 w-3" />}
                >
                  {route.is_split_route ? "Yes" : "No"}
                </Badge>
              </Table.Cell>

              <Table.Cell className="hidden md:table-cell min-w-[90px] justify-center text-center">
                <Badge
                  variant={route.return ? "brand" : "neutral"}
                  icon={route.return ? <FeatherCheck className="h-3 w-3" /> : <FeatherX className="h-3 w-3" />}
                >
                  {route.return ? "Yes" : "No"}
                </Badge>
              </Table.Cell>
              <Table.Cell className="hidden sm:table-cell min-w-[90px] justify-center text-center">
                <Badge
                  variant={route.version === "1.0" ? "warning" : "brand"}
                  icon={<FeatherTag className="h-3 w-3" />}
                >
                  {route.version || "2.0"}
                </Badge>
              </Table.Cell>
              <Table.Cell className="hidden lg:table-cell min-w-[110px]">
                <span className="whitespace-nowrap text-body font-body text-neutral-500">
                  {new Date(route.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Table.Cell>
              <Table.Cell className="hidden xl:table-cell min-w-[140px]">
                <span className="whitespace-nowrap text-body font-body flex items-center gap-1.5 text-default-font">
                  <Avvvatars value={route.created_by_user?.email || "Unknown"} size={20} style="shape" />
                  {route.created_by_user?.email || "Unknown"}
                </span>
              </Table.Cell>
              <Table.Cell className="w-12 justify-end">
                <div className="flex grow shrink-0 basis-0 items-center justify-end">
                  <SubframeCore.DropdownMenu.Root>
                    <SubframeCore.DropdownMenu.Trigger asChild={true}>
                      <IconButton
                        variant="neutral-tertiary"
                        size="medium"
                        icon={<FeatherMoreHorizontal />}
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>,
                        ) => {}}
                      />
                    </SubframeCore.DropdownMenu.Trigger>
                    <SubframeCore.DropdownMenu.Portal>
                      <SubframeCore.DropdownMenu.Content
                        side="bottom"
                        align="end"
                        sideOffset={8}
                        asChild={true}
                      >
                        <DropdownMenu>
                          <DropdownMenu.DropdownItem
                            onClick={() => onEdit(route.id)}
                            icon={<FeatherEdit2 />}
                          >
                            Edit
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem
                            onClick={() => onDuplicate(route.id, " (Copy)")}
                            icon={<SubframeCore.FeatherCopy />}
                          >
                            Duplicate
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem
                            onClick={() => onReturn(route.id, "(Return)")}
                            icon={<SubframeCore.FeatherRepeat />}
                          >
                            Make Return Route
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownDivider />
                          <DropdownMenu.DropdownItem
                            onClick={() => onDelete(route.id)}
                            icon={<SubframeCore.FeatherTrash />}
                          >
                            Delete
                          </DropdownMenu.DropdownItem>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </div>
    );
  },
);

export const RouteTable = RouteTableRoot;
