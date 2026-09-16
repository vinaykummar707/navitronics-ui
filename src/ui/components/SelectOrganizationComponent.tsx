"use client";
/*
 * Documentation:
 * Select — https://app.subframe.com/11b10bc240cf/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 * SelectOrganizationComponent — https://app.subframe.com/11b10bc240cf/library?component=SelectOrganizationComponent_662741e4-01f3-4bb5-a909-f60feb1dc4db
 */
// @subframe/sync-disable
import React, { useEffect } from "react";
import * as SubframeUtils from "../utils";
import { Select } from "./Select";
import { FeatherHotel } from "@subframe/core";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "../../store/useOrganizationStore";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { IOrganization, organizationCrud } from "@/types/organization";

interface SelectOrganizationComponentRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  collapsed?: boolean;
  onExpand?: () => void;
}

const SelectOrganizationComponentRoot = React.forwardRef<
  HTMLDivElement,
  SelectOrganizationComponentRootProps
>(function SelectOrganizationComponentRoot(
  { className, collapsed = false, onExpand, ...otherProps }: SelectOrganizationComponentRootProps,
  ref,
) {
  const { selectedOrganization, setSelectedOrganization } =
    useOrganizationStore();
  const user = useLoggedUserStore((state) => state.user); // Get user details
  const { useList } = organizationCrud;
  const { data, isLoading } = useList({
    filters: { deleted: false },
    orderBy: { column: "created_at", ascending: true },
  });

  // Safe access to organization data
  const orgs = data?.data as IOrganization[] | undefined;

  // UseEffect for setting default organization selection
  useEffect(() => {
    console.log("Organizations fetched:", data);
    const isSelectedOrgValid = orgs?.some(org => org.id === selectedOrganization?.id);
    if (selectedOrganization && !isSelectedOrgValid && orgs && orgs.length > 0) {
      setSelectedOrganization(orgs[0]); // Clear selection if it's no longer valid
    }
    if (orgs && orgs.length > 0 && user) {
      if (user.role?.name === "master" && !selectedOrganization) {
        if(!selectedOrganization) setSelectedOrganization(orgs[0]);
      } else if (user.organization?.id) {
        const assignedOrg = orgs.find(org => org.id === user.organization.id);
        if(!selectedOrganization) setSelectedOrganization(assignedOrg || null);
      }
    }
  }, [orgs, user]);

  const handleChange = (value: string) => {
    const selected = orgs?.find(org => org.id === value);
    setSelectedOrganization(selected || null);
  };

  // Only shown organizations based on role or if they are assigned to one
  const orgsToShow = user && user.role?.name === "master" ? orgs : orgs?.filter(org => org.id === user.organization?.id);

  if (isLoading) {
    return (
      <div className={collapsed ? "h-11 w-11 animate-pulse rounded-lg bg-neutral-200" : "text-caption text-subtext-color"}>
        {collapsed ? null : "Loading organizations..."}
      </div>
    );
  } else if (!orgsToShow || orgsToShow.length === 0) {
    if (collapsed) {
      return (
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-border bg-neutral-100 text-subtext-color"
          title="No organizations available"
        >
          <FeatherHotel className="w-5 h-5 text-neutral-500" />
        </div>
      );
    }
    return <div className="text-caption text-subtext-color">No organizations available</div>;
  }

  if (collapsed) {
    const orgInitials = selectedOrganization?.name
      ? selectedOrganization.name
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "NV";

    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center justify-center py-0.5",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        <button
          type="button"
          onClick={onExpand}
          className="group relative flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-border bg-sidebar-background text-brand-primary font-bold text-xs shadow-sm hover:border-brand-primary/60 hover:bg-neutral-100 transition-all cursor-pointer select-none active:scale-95"
          title={selectedOrganization?.name ? `Organization: ${selectedOrganization.name} (Click to expand)` : "Select Organization"}
        >
          {orgInitials || <FeatherHotel className="w-5 h-5" />}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-sidebar-background ring-1 ring-emerald-500/40" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-2",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <Select
        className="h-auto w-full "
        label="Select Organization"
        placeholder="Select"
        variant="filled"
        helpText=""
        value={selectedOrganization?.id || ""}
        onValueChange={handleChange}
      >
        {orgsToShow.map((org: IOrganization) => (
            <Select.Item key={org.id} value={org.id}>
              {org.name}
            </Select.Item>
          ))}
      </Select>
    </div>
  );
});
export const SelectOrganizationComponent = SelectOrganizationComponentRoot;
