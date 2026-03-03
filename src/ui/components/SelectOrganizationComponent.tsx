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
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "../../services/organizationService";
import { useOrganizationStore } from "../../store/useOrganizationStore";
import useAuthStore from "@/store/authStore";
import { useOrganizations } from "@/api/organization/hooks";
import useLoggedUserStore from "@/store/useLoggedUserStore";
import { IOrganization, organizationCrud } from "@/types/organization";

interface SelectOrganizationComponentRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SelectOrganizationComponentRoot = React.forwardRef<
  HTMLDivElement,
  SelectOrganizationComponentRootProps
>(function SelectOrganizationComponentRoot(
  { className, ...otherProps }: SelectOrganizationComponentRootProps,
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
    return <div>Loading organizations...</div>;
  } else if (!orgsToShow || orgsToShow.length === 0) {
    // Handling case where no organizations are available to show
    return <div>No organizations available or you do not have permission to view any.</div>;
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
