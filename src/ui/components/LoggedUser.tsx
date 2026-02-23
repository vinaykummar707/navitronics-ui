"use client";
/*
 * Documentation:
 * Avatar — https://app.subframe.com/11b10bc240cf/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 * Dropdown Menu — https://app.subframe.com/11b10bc240cf/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * LoggedUser — https://app.subframe.com/11b10bc240cf/library?component=LoggedUser_fd1febef-95ee-4159-9007-0e42e163fa3c
 */
// @subframe/sync-disable
import React from "react";
import { FeatherLogOut } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";
import { Avatar } from "./Avatar";
import { DropdownMenu } from "./DropdownMenu";
import { IconButton } from "./IconButton";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { ROLES } from "@/constants/roles";
import useLoggedUserStore from "@/store/useLoggedUserStore";

interface LoggedUserRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoggedUserRoot = React.forwardRef<HTMLDivElement, LoggedUserRootProps>(
  function LoggedUserRoot(
    { className, ...otherProps }: LoggedUserRootProps,
    ref
  ) {
    const user = useLoggedUserStore((state) => state.user); // Zustand store
    const logout = useLoggedUserStore((state) => state.logout); // Zustand store
    const navigate = useNavigate(); // React Router navigation4

    // write a function that returns assigned organization name, region name and depot name based on user object and role
    const use = (() => {
      if (!user) return "";
      switch (user.role.name) {
        case ROLES.MASTER:
          return "Navitronix";
        case ROLES.ORGANIZATION_ADMIN:
          return user.organization ? user.organization.name : "";
        case ROLES.REGION_ADMIN:
          return user.region ? user.region.name : "";
        case ROLES.DEPOT_ADMIN:
          return user.depot ? user.depot.name : "";
        case ROLES.USER:
          return user.depot ? user.depot.name : "";
        default:
          return "";
      }
    })();

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center gap-2",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <div className="flex grow shrink-0 basis-0 items-start gap-2">
          <Avatar image="">
            {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-caption-bold font-caption-bold text-default-font">
              {user?.email || "User Name"}
            </span>
            <span className="text-[11px] capitalize font-caption text-subtext-color">
             {use}/{user?.role.name.split("_").join(" ") || "User Role"}
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
                <DropdownMenu.DropdownItem icon={<FeatherLogOut />} onClick={() => {localStorage.clear();logout(); navigate("/login");}}>
                  Log out
                </DropdownMenu.DropdownItem>
              </DropdownMenu>
            </SubframeCore.DropdownMenu.Content>
          </SubframeCore.DropdownMenu.Portal>
        </SubframeCore.DropdownMenu.Root>
      </div>
    );
  }
);

export const LoggedUser = LoggedUserRoot;
