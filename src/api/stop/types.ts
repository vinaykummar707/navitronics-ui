export interface StopAudio {
  id: string;
  file_name: string;
  url: string;
  file_size: number;
  created_at: string;
  stop_id: string;
  deleted: boolean;
}

export interface Stop {
  id: string;
  name: string;
  organization_id: string;
  depot_id: string;
  up_latitude: number;
  up_longitude: number;
  down_latitude: number;
  down_longitude: number;
  deleted: boolean;
  created_at: string;
  active: boolean;
  stop_audios: StopAudio[];
}

// ---------- QUERIES/MUTATIONS ----------
export interface GetStopsResponse {
  stops: Stop[];
}

export interface CreateStopResponse {
  insert_stops_one: Stop;
}

export interface CreateStopVariables {
  name: string;
  organization_id: string;
  depot_id: string;
  up_latitude: number;
  up_longitude: number;
  down_latitude: number;
  down_longitude: number;
}

export interface UpdateStopInput {
  id: string;
  name?: string;
  up_latitude?: number;
  up_longitude?: number;
  down_latitude?: number;
  down_longitude?: number;
}

export interface UpdateStopResponse {
  update_stops_by_pk: Stop;
}

export interface SoftDeleteStopResponse {
  update_stops_by_pk: Stop;
}

// ----- Stop Audio -----
export interface CreateStopAudioVariables {
  stop_id: string;
  file_name: string;
  url: string;
  file_size: number;
}

export interface CreateStopAudioResponse {
  insert_stop_audios_one: StopAudio;
}

export interface UpdateStopAudioInput {
  id: string;
  file_name?: string;
  url?: string;
  file_size?: number;
}

export interface UpdateStopAudioResponse {
  update_stop_audios_by_pk: StopAudio;
}

export interface SoftDeleteStopAudioResponse {
  update_stop_audios_by_pk: StopAudio;
}