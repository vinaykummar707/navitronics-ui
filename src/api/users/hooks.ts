import {  useQuery } from "@apollo/client/react";
import { GET_USER_DETAILS, GET_USERS_BY_ORGANIZATION } from "./queries";
import { GetUserDetailsResponse, GetUsersByOrganizationResponse } from "./types";
import { gql } from "@apollo/client";

export function useUserDetails(user_id: string) {
  return useQuery<GetUserDetailsResponse>(gql(GET_USER_DETAILS), {
    variables: { user_id },
    skip: !user_id,
  });
}

// function to get all not deleted users of an organization
export function useUsersByOrganization(organization_id: string) {
  return useQuery<GetUsersByOrganizationResponse>(gql(GET_USERS_BY_ORGANIZATION), {
    variables: { organization_id },
    skip: !organization_id,
  });
}