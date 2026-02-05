import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_DEPOT, GET_DEPOTS, SOFT_DELETE_DEPOT, UPDATE_DEPOT } from './queries';
import {
  CreateDepotResponse,
  CreateDepotVariables,
  DeleteDepotResponse,
  GetDepotsResponse,
  UpdateDepotInput,
  UpdateDepotResponse,
} from './types';

export function useDepots(options: { variables: { organization_id: string; region_id: string } }) {
  return useQuery<GetDepotsResponse>(gql(GET_DEPOTS), options);
}

export function useCreateDepot() {
  return useMutation<CreateDepotResponse, CreateDepotVariables>(
    gql(CREATE_DEPOT)
  );
}

export function useUpdateDepot() {
  return useMutation<UpdateDepotResponse, UpdateDepotInput>(
    gql(UPDATE_DEPOT)
  );
}

export function useDeleteDepot() {
  return useMutation<DeleteDepotResponse, { id: string }>(
    gql(SOFT_DELETE_DEPOT)
  );
}