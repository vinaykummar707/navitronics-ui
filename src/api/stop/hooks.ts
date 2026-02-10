import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CREATE_STOP,
  GET_STOPS,
  SOFT_DELETE_STOP,
  UPDATE_STOP,
  CREATE_STOP_AUDIO,
  UPDATE_STOP_AUDIO,
  SOFT_DELETE_STOP_AUDIO,
} from './queries';
import {
  CreateStopResponse,
  CreateStopVariables,
  GetStopsResponse,
  UpdateStopInput,
  UpdateStopResponse,
  SoftDeleteStopResponse,
  CreateStopAudioVariables,
  CreateStopAudioResponse,
  UpdateStopAudioInput,
  UpdateStopAudioResponse,
  SoftDeleteStopAudioResponse,
} from './types';

export function useStops(options: { variables: { organization_id: string; depot_id: string } }) {
  return useQuery<GetStopsResponse>(gql(GET_STOPS), options);
}

export function useCreateStop() {
  return useMutation<CreateStopResponse, CreateStopVariables>(
    gql(CREATE_STOP)
  );
}

export function useUpdateStop() {
  return useMutation<UpdateStopResponse, UpdateStopInput>(
    gql(UPDATE_STOP)
  );
}

export function useSoftDeleteStop() {
  return useMutation<SoftDeleteStopResponse, { id: string }>(
    gql(SOFT_DELETE_STOP)
  );
}

// ---- AUDIO ----

export function useCreateStopAudio() {
  return useMutation<CreateStopAudioResponse, CreateStopAudioVariables>(
    gql(CREATE_STOP_AUDIO)
  );
}

export function useUpdateStopAudio() {
  return useMutation<UpdateStopAudioResponse, UpdateStopAudioInput>(
    gql(UPDATE_STOP_AUDIO)
  );
}

export function useSoftDeleteStopAudio() {
  return useMutation<SoftDeleteStopAudioResponse, { id: string }>(
    gql(SOFT_DELETE_STOP_AUDIO)
  );
}