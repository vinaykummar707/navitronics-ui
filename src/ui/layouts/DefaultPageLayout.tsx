"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/11b10bc240cf/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * LoggedUser — https://app.subframe.com/11b10bc240cf/library?component=LoggedUser_fd1febef-95ee-4159-9007-0e42e163fa3c
 * SelectOrganizationComponent — https://app.subframe.com/11b10bc240cf/library?component=SelectOrganizationComponent_662741e4-01f3-4bb5-a909-f60feb1dc4db
 * Sidebar with sections — https://app.subframe.com/11b10bc240cf/library?component=Sidebar+with+sections_f4047c8b-cfb4-4761-b9cf-fbcae8a9b9b5
 */
// @subframe/sync-disable
// @subframe/sync-disable
import React, { useEffect } from "react";
import {
  FeatherBriefcase,
  FeatherBuilding2,
  FeatherGlobe2,
  FeatherLayoutDashboard,
  FeatherLogOut,
  FeatherMapPin,
  FeatherMenu,
  FeatherNavigation,
  FeatherRoute,
  FeatherType,
  FeatherUserCheck,
  FeatherUsers,
  FeatherWarehouse,
  FeatherX,
} from "@subframe/core";
import { SelectOrganizationComponent } from "../components/SelectOrganizationComponent";
import { SidebarWithSections } from "../components/SidebarWithSections";
import * as SubframeUtils from "../utils";
import { useLocation, useNavigate } from "react-router-dom";
import RBAC from "@/components/RBAC";
import { ROLES, getRoleLabel } from "@/constants/roles";
import { ThemeToggle } from "@/components/ThemeToggle";
import useToggleStore from "@/store/useToggleStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import {
  isRegularCustomer,
  isSuperAdmin,
  getDefaultRouteForUser,
} from "@/utils/customerType";
import { IconButton } from "../components/IconButton";
import { supabase } from "@/supabaseClient";

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
  const showSidebar = useToggleStore((state) => state.showSidebar);
  const toggleSidebar = useToggleStore((state) => state.toggleSidebar);
  const isMobileMenuOpen = useToggleStore((state) => state.isMobileMenuOpen);
  const toggleMobileMenu = useToggleStore((state) => state.toggleMobileMenu);
  const setMobileMenuOpen = useToggleStore((state) => state.setMobileMenuOpen);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  const handleNavClick = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  const handleToggleClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleMobileMenu();
    } else {
      toggleSidebar();
    }
  };

  const user = useLoggedUserStore((state) => state.user);
  const logout = useLoggedUserStore((state) => state.logout);
  const isRegular = isRegularCustomer(user);
  const isSuper = isSuperAdmin(user);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    logout();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore storage access errors
    }
    navigate("/login", { replace: true });
  };

  const userRoleName = user?.role?.name?.toLowerCase() || "";
  const roleLabel =
    userRoleName === "master"
      ? "Super Admin"
      : userRoleName
      ? getRoleLabel(userRoleName)
      : "User";

  const userScope = (() => {
    if (!user) return "";
    switch (userRoleName) {
      case "master":
        return "System Admin";
      case "organization_admin":
        return user.organization?.name || "";
      case "region_admin":
        return user.region?.name || user.organization?.name || "";
      case "depot_admin":
        return user.depot?.name || user.region?.name || "";
      case "guest":
        return user.organization?.name || "View Only";
      default:
        return "";
    }
  })();

  const renderNavItems = () => {
    if (isRegular) {
      return (
        <SidebarWithSections.NavSection className="no-scrollbar" label="Menu">
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/regular-routes")}
            onClick={() => handleNavClick("/home/regular-routes")}
            icon={<FeatherNavigation />}
          >
            My Routes
          </SidebarWithSections.NavItem>
        </SidebarWithSections.NavSection>
      );
    }

    if (isSuper) {
      return (
        <>
          <SidebarWithSections.NavSection className="no-scrollbar" label="STU Operations">
            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/dashboard")}
              onClick={() => handleNavClick("/home/dashboard")}
              icon={<FeatherLayoutDashboard />}
            >
              Dashboard
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/organizations")}
              onClick={() => handleNavClick("/home/organizations")}
              icon={<FeatherBuilding2 />}
            >
              Organizations
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/regions")}
              onClick={() => handleNavClick("/home/regions")}
              icon={<FeatherGlobe2 />}
            >
              Regions
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/depots")}
              onClick={() => handleNavClick("/home/depots")}
              icon={<FeatherWarehouse />}
            >
              Depots
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/stops")}
              onClick={() => handleNavClick("/home/stops")}
              icon={<FeatherMapPin />}
            >
              Stops
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/routes")}
              onClick={() => handleNavClick("/home/routes")}
              icon={<FeatherRoute />}
            >
              STU Routes
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/users")}
              onClick={() => handleNavClick("/home/users")}
              icon={<FeatherUsers />}
            >
              STU Users
            </SidebarWithSections.NavItem>

            {/* <SidebarWithSections.NavItem
              selected={path.startsWith("/home/guests")}
              onClick={() => handleNavClick("/home/guests")}
              icon={<FeatherUserCheck />}
            >
              Guests
            </SidebarWithSections.NavItem> */}
          </SidebarWithSections.NavSection>

          <SidebarWithSections.NavSection className="no-scrollbar" label="Regular Customers">
            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/regular-routes")}
              onClick={() => handleNavClick("/home/regular-routes")}
              icon={<FeatherNavigation />}
            >
              Regular Routes
            </SidebarWithSections.NavItem>

            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/regular-customers")}
              onClick={() => handleNavClick("/home/regular-customers")}
              icon={<FeatherBriefcase />}
            >
              Regular Customers
            </SidebarWithSections.NavItem>
          </SidebarWithSections.NavSection>

          <SidebarWithSections.NavSection label="Administrator">
            <SidebarWithSections.NavItem
              selected={path.startsWith("/home/font-configuration")}
              onClick={() => handleNavClick("/home/font-configuration")}
              icon={<FeatherType />}
            >
              Font Configuration
            </SidebarWithSections.NavItem>
          </SidebarWithSections.NavSection>
        </>
      );
    }

    // STU Enterprise Users & Guests
    return (
      <SidebarWithSections.NavSection className="no-scrollbar" label="Menu">
        <RBAC
          roles={[
            ROLES.ORGANIZATION_ADMIN,
            ROLES.REGION_ADMIN,
           
          ]}
          features={[]}
        >
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/dashboard")}
            onClick={() => handleNavClick("/home/dashboard")}
            icon={<FeatherLayoutDashboard />}
          >
            Dashboard
          </SidebarWithSections.NavItem>
        </RBAC>

        <RBAC roles={[ROLES.GUEST]} features={[]}>
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/organizations")}
            onClick={() => handleNavClick("/home/organizations")}
            icon={<FeatherBuilding2 />}
          >
            Organizations
          </SidebarWithSections.NavItem>
        </RBAC>

        <RBAC
          roles={[ROLES.ORGANIZATION_ADMIN]}
          features={["PIS", "PAS", "ITMS"]}
        >
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/regions")}
            onClick={() => handleNavClick("/home/regions")}
            icon={<FeatherGlobe2 />}
          >
            Regions
          </SidebarWithSections.NavItem>
        </RBAC>

        <RBAC
          roles={[
           
            ROLES.REGION_ADMIN,
            ROLES.ORGANIZATION_ADMIN,
            ROLES.GUEST,
          ]}
          features={["PIS", "PAS", "ITMS"]}
        >
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/depots")}
            onClick={() => handleNavClick("/home/depots")}
            icon={<FeatherWarehouse />}
          >
            Depots
          </SidebarWithSections.NavItem>
        </RBAC>

        <RBAC
          roles={[
            ROLES.DEPOT_ADMIN,
            ROLES.REGION_ADMIN,
            ROLES.ORGANIZATION_ADMIN
          ]}
          features={["PAS", "ITMS"]}
        >
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/stops")}
            onClick={() => handleNavClick("/home/stops")}
            icon={<FeatherMapPin />}
          >
            Stops
          </SidebarWithSections.NavItem>
        </RBAC>

        <RBAC
          roles={[
            ROLES.DEPOT_ADMIN,
            ROLES.REGION_ADMIN,
            ROLES.ORGANIZATION_ADMIN,
            ROLES.GUEST,
          ]}
          features={["PIS", "PAS", "ITMS"]}
        >
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/routes")}
            onClick={() => handleNavClick("/home/routes")}
            icon={<FeatherRoute />}
          >
            Routes
          </SidebarWithSections.NavItem>
        </RBAC>

        <RBAC
          roles={[
            ROLES.ORGANIZATION_ADMIN,
            ROLES.REGION_ADMIN,
           
          ]}
          features={[]}
        >
          <SidebarWithSections.NavItem
            selected={path.startsWith("/home/users")}
            onClick={() => handleNavClick("/home/users")}
            icon={<FeatherUsers />}
          >
            Users
          </SidebarWithSections.NavItem>
        </RBAC>
      </SidebarWithSections.NavSection>
    );
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-[100dvh] min-h-[100dvh] w-full max-w-full flex-col overflow-hidden bg-default-background",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {/* Global Top Bar with safe-area padding */}
      <header className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border bg-sidebar-background px-3 sm:px-4 z-20 pt-safe">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <IconButton
            variant="neutral-tertiary"
            onClick={handleToggleClick}
            icon={<FeatherMenu className="text-default-font" />}
            title="Toggle navigation"
          />
          <div className="h-5 w-px bg-neutral-border flex-none" />
          <div
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none min-w-0"
            onClick={() => {
              navigate(getDefaultRouteForUser(user));
            }}
          >
            <img
              className="h-8 w-8 rounded-full object-cover ring-1 ring-neutral-border flex-none"
              src="https://navitronix.in/assets/navitronix.jpeg"
              alt="Navitronix"
            />
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-body-bold font-body-bold tracking-tight text-default-font font-bold truncate">
                NAVITRONIX
              </span>
              <span className="inline-flex rounded px-1.5 py-0.5 text-micro font-micro-bold text-brand-primary bg-brand-50 border border-brand-200/40 flex-none">
                RMS
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Theme Switcher & Directly Visible Logged User Information */}
        <div className="flex items-center gap-2 sm:gap-3 flex-none">
          <ThemeToggle />
          <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-neutral-border">
            
            <div className="flex flex-col items-start leading-tight min-w-0 select-none">
              <span className="text-caption-bold font-caption-bold text-default-font truncate max-w-[130px] sm:max-w-[200px] md:max-w-[240px]">
                {user?.email || "User"}
              </span>
              <div className="flex items-center gap-1.5 mt-1 min-w-0">
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary bg-brand-50/80 border border-brand-200/50 capitalize flex-none">
                  {roleLabel}
                </span>
                {userScope ? (
                  <span className="text-[11px] text-subtext-color truncate max-w-[120px] hidden md:inline">
                    • {userScope}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Workspace: Desktop Sidebar + Content */}
      <div className="relative flex w-full grow shrink-0 basis-0 items-start overflow-hidden">
        {/* Desktop Docked Sidebar (hidden on tablet/mobile < 1024px) */}
        {showSidebar && (
          <div className="hidden lg:flex h-full flex-none">
            <SidebarWithSections
              collapsed={false}
              header={
                !isRegular ? (
                  <SelectOrganizationComponent
                    className="shrink-0 w-full"
                    collapsed={false}
                  />
                ) : null
              }
              footer={
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 transition-colors w-full cursor-pointer select-none text-caption font-caption-bold"
                  title="Log out"
                >
                  <FeatherLogOut className="w-4 h-4 flex-none" />
                  <span>Log out</span>
                </button>
              }
            >
              {renderNavItems()}
            </SidebarWithSections>
          </div>
        )}

        {/* Mobile & Tablet Slide-over Drawer (< 1024px) */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={SubframeUtils.twClassNames(
            "fixed inset-y-0 left-0 z-50 flex flex-col w-72 max-w-[85vw] bg-sidebar-background shadow-2xl border-r border-neutral-border transition-transform duration-300 ease-in-out lg:hidden pt-safe pb-safe",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          )}
        >
          <div className="flex h-14 items-center justify-between px-4 border-b border-neutral-border flex-none">
            <div className="flex items-center gap-2">
              <img
                className="h-7 w-7 rounded-full object-cover ring-1 ring-neutral-border flex-none"
                src="https://navitronix.in/assets/navitronix.jpeg"
                alt="Navitronix"
              />
              <span className="font-bold text-sm tracking-tight text-default-font">
                Navigation
              </span>
            </div>
            <IconButton
              variant="neutral-tertiary"
              size="small"
              icon={<FeatherX className="h-4 w-4" />}
              onClick={() => setMobileMenuOpen(false)}
              title="Close navigation"
            />
          </div>

          {!isRegular && (
            <div className="pt-3 px-3 border-neutral-border/60 flex-none">
              <SelectOrganizationComponent className="w-full" collapsed={false} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3  no-scrollbar">
            {renderNavItems()}
          </div>

          <div className="p-3 border-t border-neutral-border flex-none">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-500/10 transition-colors w-full cursor-pointer select-none text-caption font-caption-bold"
              title="Log out"
            >
              <FeatherLogOut className="w-4 h-4 flex-none" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Content with Responsive Padding */}
        {children ? (
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch overflow-y-auto bg-default-background px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 transition-all duration-200 pb-safe">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
