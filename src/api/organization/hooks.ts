import {  gql } from '@apollo/client';
import { CREATE_ORGANIZATION, GET_ORGANIZATIONS, GET_ROLES, UPDATE_ORGANIZATION } from './queries';
import { CreateOrganizationInput, CreateOrganizationResponse, GetOrganizationsResponse, UpdateOrganizationInput, UpdateOrganizationResponse } from './types';
import { useMutation, useQuery } from "@apollo/client/react";

export function useOrganizations() {
  return useQuery<GetOrganizationsResponse>(gql(GET_ORGANIZATIONS));
}


export function useCreateOrganization() {
  return useMutation<CreateOrganizationResponse, { object: CreateOrganizationInput }>(
    gql(CREATE_ORGANIZATION)
  );
}


export function useUpdateOrganization() {
  return useMutation<UpdateOrganizationResponse, UpdateOrganizationInput>(
    gql(UPDATE_ORGANIZATION)
  );
}


export function useRoles() {
  return useQuery(gql(GET_ROLES));
}