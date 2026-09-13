"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/11b10bc240cf/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * LoggedUser — https://app.subframe.com/11b10bc240cf/library?component=LoggedUser_fd1febef-95ee-4159-9007-0e42e163fa3c
 * SelectOrganizationComponent — https://app.subframe.com/11b10bc240cf/library?component=SelectOrganizationComponent_662741e4-01f3-4bb5-a909-f60feb1dc4db
 * Sidebar with sections — https://app.subframe.com/11b10bc240cf/library?component=Sidebar+with+sections_f4047c8b-cfb4-4761-b9cf-fbcae8a9b9b5
 */
// @subframe/sync-disable
import React from "react";
import { FeatherBusFront, FeatherCctv, FeatherPanelLeft } from "@subframe/core";
import { FeatherCpu } from "@subframe/core";
import { FeatherGlobe2 } from "@subframe/core";
import { FeatherHotel } from "@subframe/core";
import { FeatherMapPin } from "@subframe/core";
import { FeatherPlaneTakeoff } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherType } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { LoggedUser } from "../components/LoggedUser";
import { SelectOrganizationComponent } from "../components/SelectOrganizationComponent";
import { SidebarWithSections } from "../components/SidebarWithSections";
import * as SubframeUtils from "../utils";
import { useLocation, useNavigate } from "react-router-dom";
import RBAC from "@/components/RBAC";
import { ROLES } from "@/constants/roles";
import useToggleStore from "@/store/useToggleStore";
import { IconButton } from "../components/IconButton";

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
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const {showSidebar,toggleSidebar} = useToggleStore()
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-screen w-screen flex-col overflow-hidden bg-default-background",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Global Top Bar */}
      <header className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border bg-sidebar-background px-4 z-20">
        <div className="flex items-center gap-3">
          <IconButton
            variant="neutral-tertiary"
            onClick={toggleSidebar}
            icon={<FeatherPanelLeft className="text-default-font" />}
          />
          <div className="h-5 w-px bg-neutral-border" />
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate("/home/routes")}
          >
            <img
              className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-border flex-none"
              src="https://navitronix.in/assets/navitronix.jpeg"
              alt="Navitronix"
            />
            <div className="flex items-center gap-2">
              <span className="text-body-bold font-body-bold tracking-tight text-default-font font-bold">
                NAVITRONIX
              </span>
              <span className="hidden sm:inline-flex rounded px-1.5 py-0.5 text-[10px] font-caption-bold text-brand-primary bg-brand-50 border border-brand-200/40">
                RMS
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Logged user avatar with dropdown */}
        <div className="flex items-center">
          <LoggedUser />
        </div>
      </header>

      {/* Main App Workspace: Sidebar + Content */}
      <div className="flex w-full grow shrink-0 basis-0 items-start overflow-hidden">
        <SidebarWithSections
          className={showSidebar ? "flex-shrink-0" : "hidden"}
          header={<SelectOrganizationComponent className="shrink-0 w-full" />}
        >
          <SidebarWithSections.NavSection className="no-scrollbar" label="Menu">
            <RBAC roles={["master"]} features={[]}>
              <SidebarWithSections.NavItem selected={path.startsWith("/home/organizations")} onClick={() => navigate("/home/organizations")} icon={<FeatherHotel />} >
                Organizations
              </SidebarWithSections.NavItem>
            </RBAC>
            <RBAC roles={[ROLES.MASTER, ROLES.ORGANIZATION_ADMIN, ROLES.REGION_ADMIN]} features={["PIS", "PAS", "ITMS"]}>
              <SidebarWithSections.NavItem selected={path.startsWith("/home/regions")} onClick={() => navigate("/home/regions")} icon={<FeatherGlobe2 />}>
                Regions
              </SidebarWithSections.NavItem>
            </RBAC>
            <RBAC roles={[ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]} features={["PIS", "PAS", "ITMS"]}>
              <SidebarWithSections.NavItem selected={path.startsWith("/home/depots")} onClick={() => navigate("/home/depots")} icon={<FeatherBusFront />}>
                Depots
              </SidebarWithSections.NavItem>
            </RBAC>
            <RBAC roles={[ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]} features={["PAS", "ITMS"]}>
              <SidebarWithSections.NavItem selected={path.startsWith("/home/stops")} onClick={() => navigate("/home/stops")} icon={<FeatherMapPin />}>
                Stops
              </SidebarWithSections.NavItem>
            </RBAC>
           
            <RBAC roles={[ROLES.DEPOT_ADMIN, ROLES.REGION_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER]} features={["PIS", "PAS", "ITMS"]}>
              <SidebarWithSections.NavItem selected={path.startsWith("/home/routes")} onClick={() => navigate("/home/routes")} icon={<FeatherPlaneTakeoff />}>
                Routes
              </SidebarWithSections.NavItem>
            </RBAC>
            <RBAC roles={[ROLES.MASTER]} features={[]}>
              <SidebarWithSections.NavItem selected={path.startsWith("/home/users")} onClick={() => navigate("/home/users")} icon={<FeatherUsers />}>
                Users
              </SidebarWithSections.NavItem>
            </RBAC>
          </SidebarWithSections.NavSection>

          <RBAC roles={[ROLES.MASTER]} features={[]}>
            <SidebarWithSections.NavSection label="Administrator">
              {/* <SidebarWithSections.NavItem selected={path.startsWith("/home/utility")} onClick={() => navigate("/home/utility")} icon={<FeatherCpu />}>
                Utility
              </SidebarWithSections.NavItem> */}
              <SidebarWithSections.NavItem selected={path.startsWith("/home/font-configuration")} onClick={() => navigate("/home/font-configuration")} icon={<FeatherType />}>
                Font Configuration
              </SidebarWithSections.NavItem>
              {/* <SidebarWithSections.NavItem selected={path.startsWith("/home/settings")} onClick={() => navigate("/home/settings")} icon={<FeatherSettings />}>
                Settings
              </SidebarWithSections.NavItem> */}
            </SidebarWithSections.NavSection>
          </RBAC>
        </SidebarWithSections>
        {children ? (
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch overflow-y-auto bg-default-background px-8 py-8">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
