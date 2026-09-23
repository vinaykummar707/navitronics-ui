import { createCrudHooks } from "@/hooks/useCrud";

export interface IStop {
  id: string;
  name: string;
  organization_id: string;
  depot_id: string;
  up_latitude: string;
  up_longitude: string;
  down_latitude: string;
  down_longitude: string;
  created_at: string;
  active: boolean;
}

export interface IStopWithAudio {
  id: string;
  name: string;
  organization_id: string;
  depot_id: string;
  up_latitude: string;
  up_longitude: string;
  down_latitude: string;
  down_longitude: string;
  created_at: string;
  active: boolean;
  stop_audios:IStopAudio
}

export interface IStopAudio {
  id: string;
  file_name: string;
  url: string;
  file_size: number;
  created_at: string;
  stop_id: string;
}



// Create: everything but id, created_at; all optional except name
export type IStopCreate = Omit<Partial<IStop>, 'id' | 'created_at' | 'active' | 'stop_audios'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IStopUpdate = Pick<IStop, 'id'> & Partial<Omit<IStop, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IStopDelete = Pick<IStop, 'id'>;
export type IStopGet = Pick<IStop, 'id'>;



// Create the hooks for 'stops' table
export const stopCrud = createCrudHooks<IStop, IStopCreate, IStopUpdate>('stops')