"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/11b10bc240cf/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Default Page Layout — https://app.subframe.com/11b10bc240cf/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Dropdown Menu — https://app.subframe.com/11b10bc240cf/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * SelectOrganizationComponent — https://app.subframe.com/11b10bc240cf/library?component=SelectOrganizationComponent_662741e4-01f3-4bb5-a909-f60feb1dc4db
 * Sidebar with sections — https://app.subframe.com/11b10bc240cf/library?component=Sidebar+with+sections_f4047c8b-cfb4-4761-b9cf-fbcae8a9b9b5
 */

import React from "react";
import { FeatherBusFront } from "@subframe/core";
import { FeatherGlobe2 } from "@subframe/core";
import { FeatherHotel } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlaneTakeoff } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherShieldCheck } from "@subframe/core";
import { FeatherType } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { Avatar } from "../components/Avatar";
import { DropdownMenu } from "../components/DropdownMenu";
import { IconButton } from "../components/IconButton";
import { SelectOrganizationComponent } from "../components/SelectOrganizationComponent";
import { SidebarWithSections } from "../components/SidebarWithSections";
import * as SubframeUtils from "../utils";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<
  HTMLDivElement,
  DefaultPageLayoutRootProps
>(function DefaultPageLayoutRoot(
  { children, className, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-screen items-start w-screen overflow-hidden",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <SidebarWithSections
        className="mobile:hidden"
        header={
          <>
            <img
              className="h-6 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            />
            <SelectOrganizationComponent />
          </>
        }
        footer={
          <>
            <div className="flex grow shrink-0 basis-0 items-start gap-2">
              <Avatar image="https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg">
                A
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-caption-bold font-caption-bold text-default-font">
                  Irvin
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Founder
                </span>
              </div>
            </div>
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton size="small" icon={<FeatherMoreHorizontal />} />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <DropdownMenu.DropdownItem icon={<FeatherUser />}>
                      Profile
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherSettings />}>
                      Settings
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherLogOut />}>
                      Log out
                    </DropdownMenu.DropdownItem>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </>
        }
      >
        <SidebarWithSections.NavSection label="Menu">
          <SidebarWithSections.NavItem icon={<FeatherHotel />} selected={true}>
            Organizations
          </SidebarWithSections.NavItem>
          <SidebarWithSections.NavItem icon={<FeatherGlobe2 />}>
            Regions
          </SidebarWithSections.NavItem>
          <SidebarWithSections.NavItem icon={<FeatherBusFront />}>
            Depots
          </SidebarWithSections.NavItem>
          <SidebarWithSections.NavItem icon={<FeatherPlaneTakeoff />}>
            Routes
          </SidebarWithSections.NavItem>
          <SidebarWithSections.NavItem icon={<FeatherUsers />}>
            Users
          </SidebarWithSections.NavItem>
        </SidebarWithSections.NavSection>
        <SidebarWithSections.NavSection label="Administrator">
          <SidebarWithSections.NavItem icon={<FeatherShieldCheck />}>
            Roles
          </SidebarWithSections.NavItem>
          <SidebarWithSections.NavItem icon={<FeatherType />}>
            Font Configuration
          </SidebarWithSections.NavItem>
          <SidebarWithSections.NavItem icon={<FeatherSettings />}>
            Settings
          </SidebarWithSections.NavItem>
        </SidebarWithSections.NavSection>
      </SidebarWithSections>
      {children ? (
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch overflow-y-auto bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
