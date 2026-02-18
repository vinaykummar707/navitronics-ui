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
import { FeatherEdit2, FeatherMoreHorizontal } from "@subframe/core";
import { DropdownMenu } from "./DropdownMenu";
import { DisplayConfigGetRequest } from "@/types/routeConfigV2";

interface RouteTableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  routes?: DisplayConfigGetRequest[]; // Replace 'any' with your actual route type
  className?: string;
  onEdit?: (routeId: string) => void; // Callback for edit action
  onDelete?: (routeId: string) => void; // Callback for delete action
  onDuplicate?: (routeId: string, suffix: string) => void; // Callback for duplicate action
}

const RouteTableRoot = React.forwardRef<HTMLDivElement, RouteTableRootProps>(
  function RouteTableRoot(
    { children, routes, className, onEdit, onDelete, onDuplicate, ...otherProps }: RouteTableRootProps,
    ref,
  ) {
    // log routes
    React.useEffect(() => {
      console.log("Routes in RouteTable:", routes);
    }, [routes]);
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-neutral-50 px-4 py-4",
          className,
        )}
        ref={ref}
        {...otherProps}
      >
          <Table
            header={
              <Table.HeaderRow>
                <Table.HeaderCell>Route No</Table.HeaderCell>
                <Table.HeaderCell>Source</Table.HeaderCell>
                <Table.HeaderCell>Destination</Table.HeaderCell>
                <Table.HeaderCell>Split Route</Table.HeaderCell>
                <Table.HeaderCell>Return</Table.HeaderCell>
                <Table.HeaderCell>Version</Table.HeaderCell>
                <Table.HeaderCell>Created At</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.HeaderRow>
            }
          >
            {routes.map((route: DisplayConfigGetRequest) => (
              <Table.Row key={route.id}>
                <Table.Cell>
                  <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
                    {!route.is_split_route ? `${route.route_number}` : `${route.route_number_1} - ${route.route_number_2}`}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="whitespace-nowrap text-body font-body text-neutral-500">
                    {route.source}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="whitespace-nowrap text-body font-body text-neutral-500">
                    {route.destination}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant={route.is_split_route ? "brand" : "error"}>
                    {" "}
                    {route.is_split_route ? "Yes" : "No"}{" "}
                  </Badge>
                </Table.Cell>
             
                <Table.Cell>
                  <Badge variant={route.return ? "brand" : "error"}>
                    {route.return ? "Yes" : "No"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <span className="whitespace-nowrap text-body font-body text-default-font">
                    {route.version}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="whitespace-nowrap text-body font-body text-neutral-500">
                    {new Date(route.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Table.Cell>
                <Table.Cell>
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
                            <DropdownMenu.DropdownItem onClick={()=> onEdit(route.id)}  icon={<FeatherEdit2 />}>
                              Edit
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownItem
                                onClick={()=> onDuplicate(route.id, " (Copy)")}
                              icon={<SubframeCore.FeatherCopy />}
                            >
                              Duplicate 
                            </DropdownMenu.DropdownItem>
                            <DropdownMenu.DropdownDivider />
                            <DropdownMenu.DropdownItem
                              onClick={()=> onDelete(route.id)}
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
