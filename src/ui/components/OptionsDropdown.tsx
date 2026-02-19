// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Dropdown Menu — https://app.subframe.com/11b10bc240cf/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * OptionsDropdown — https://app.subframe.com/11b10bc240cf/library?component=OptionsDropdown_bc577ea2-ce5e-4b95-8b05-1eab56f8b728
 */

import React from "react";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPencil } from "@subframe/core";
import { FeatherTrash } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { DropdownMenu } from "./DropdownMenu";
import { IconButton } from "./IconButton";

//implement output events for edit and delete actions later

interface OptionsDropdownRootProps
  extends React.ComponentProps<typeof IconButton> {
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDisabled?: boolean;
}

const OptionsDropdownRoot = React.forwardRef<
  React.ElementRef<typeof IconButton>,
  OptionsDropdownRootProps

>(function OptionsDropdownRoot(
  { className, onEdit, onDelete, isDisabled, ...otherProps }: OptionsDropdownRootProps,
  ref
) {
  return (
    <SubframeCore.DropdownMenu.Root>
      <SubframeCore.DropdownMenu.Trigger asChild={true}>
        <IconButton
          className={className}
          icon={<FeatherMoreHorizontal />}
          ref={ref}
          disabled={isDisabled}
          {...otherProps}
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
            <DropdownMenu.DropdownItem onClick={onEdit} icon={<FeatherPencil />}>
              Edit
            </DropdownMenu.DropdownItem>
            <DropdownMenu.DropdownItem onClick={onDelete} icon={<FeatherTrash />}>
              Delete
            </DropdownMenu.DropdownItem>
          </DropdownMenu>
        </SubframeCore.DropdownMenu.Content>
      </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
  );
});

export const OptionsDropdown = OptionsDropdownRoot;
