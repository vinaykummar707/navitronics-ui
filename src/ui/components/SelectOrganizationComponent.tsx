"use client";
/*
 * Documentation:
 * Select — https://app.subframe.com/11b10bc240cf/library?component=Select_bb88f90b-8c43-4b73-9c2f-3558ce7838f3
 * SelectOrganizationComponent — https://app.subframe.com/11b10bc240cf/library?component=SelectOrganizationComponent_662741e4-01f3-4bb5-a909-f60feb1dc4db
 */

import React, { useEffect } from "react";
import * as SubframeUtils from "../utils";
import { Select } from "./Select";
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "../../services/organizationService";
import { useOrganizationStore } from "../../store/useOrganizationStore";
import useAuthStore from "@/store/authStore";
import { useOrganizations } from "@/api/organization/hooks";

interface SelectOrganizationComponentRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SelectOrganizationComponentRoot = React.forwardRef<
  HTMLDivElement,
  SelectOrganizationComponentRootProps
>(function SelectOrganizationComponentRoot(
  { className, ...otherProps }: SelectOrganizationComponentRootProps,
  ref
) {
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();
  const user = useAuthStore((state) => state.user); // Get user details
  const { data, loading } = useOrganizations();
  const orgs = data?.organizations || [];

  console.log("Organizations fetched:", user);


  // Filter organizations based on user's assigned organization
  const filteredOrganizations = user?.organization
    ? orgs.filter(
      (org: any) => org.id === user.organization.organizationId
    )
    : orgs;

  useEffect(() => {
    if (orgs && orgs.length > 0 && !selectedOrganization) {
      setSelectedOrganization(orgs[0]); // Set the first organization as selected
    }
  }, [orgs, selectedOrganization, setSelectedOrganization]);

  const handleChange = (value: string) => {
    const selected = orgs.find(
      (org: any) => org.id === value
    );
    setSelectedOrganization(selected || null);
  };

  const orgsToShow =
    user.userRole === "master" ? orgs : filteredOrganizations;

  if (loading) {
    return <div>Loading organizations...</div>;
  }

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start gap-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <Select
        className="h-auto w-full flex-none"
        label="Select Organization"
        placeholder="Select"
        helpText=""
        value={selectedOrganization?.id || ""}
        onValueChange={handleChange}
      >
        {orgsToShow && orgsToShow?.map((org: any) => (
          <Select.Item key={org.id} value={org.id}>
            {org.name}
          </Select.Item>
        ))}
      </Select>
    </div>
  );
});

export const SelectOrganizationComponent = SelectOrganizationComponentRoot;