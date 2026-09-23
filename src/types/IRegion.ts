import { createCrudHooks } from "@/hooks/useCrud";

export interface IRegion {
    id: string;
    name: string;
    created_at: string;
    organization_id: string;
}

// Create: everything but id, created_at; all optional except name
export type IRegionCreate = Omit<Partial<IRegion>, 'id' | 'created_at'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IRegionUpdate = Pick<IRegion, 'id'> & Partial<Omit<IRegion, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IRegionDelete = Pick<IRegion, 'id'>;
export type IRegionGet = Pick<IRegion, 'id'>;



// Create the hooks for 'regions' table
export const regionCrud = createCrudHooks<IRegion, IRegionCreate, IRegionUpdate>('regions')