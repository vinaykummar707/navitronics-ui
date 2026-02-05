import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_REGION, GET_REGIONS, SOFT_DELETE_REGION, UPDATE_REGION } from './queries';
import {
  CreateRegionResponse,
  CreateRegionVariables,
  DeleteRegionResponse,
  GetRegionsResponse,
  UpdateRegionInput,
  UpdateRegionResponse,
} from './types';

export function useRegions(options: { variables: { organization_id: string } }) {
  return useQuery<GetRegionsResponse>(gql(GET_REGIONS), options);
}

export function useCreateRegion() {
  return useMutation<CreateRegionResponse, CreateRegionVariables>(
    gql(CREATE_REGION)
  );
}

export function useUpdateRegion() {
  return useMutation<UpdateRegionResponse, UpdateRegionInput>(
    gql(UPDATE_REGION)
  );
}

export function useDeleteRegion() {
  return useMutation<DeleteRegionResponse, { id: string }>(
    gql(SOFT_DELETE_REGION)
  );
}
