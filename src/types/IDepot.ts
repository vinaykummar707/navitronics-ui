import { createCrudHooks } from "@/hooks/useCrud";

export interface IDepot {
    id: string;
    name: string;
    created_at: string;
    organization_id: string;
    region_id: string;
}

// Create: everything but id, created_at; all optional except name
export type IDepotCreate = Omit<Partial<IDepot>, 'id' | 'created_at'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IDepotUpdate = Pick<IDepot, 'id'> & Partial<Omit<IDepot, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IDepotDelete = Pick<IDepot, 'id'>;
export type IDepotGet = Pick<IDepot, 'id'>;



// Create the hooks for 'depots' table
export const depotCrud = createCrudHooks<IDepot, IDepotCreate, IDepotUpdate>('depots')