import { createCrudHooks } from "@/hooks/useCrud";

export interface IOrganization {
    id: string;
    email: string | null;
    logo: string | null;
    name: string;
    phone: string | null;
    created_at: string;
    active: boolean;
    PIS: boolean;
    PAS: boolean;
    ITMS: boolean;
    v1_routes?: boolean | null;
    v2_routes?: boolean | null;
    customer_type?: "regular" | "stu" | null;
}

// Create: everything but id, created_at; all optional except name
export type IOrganizationCreate = Omit<Partial<IOrganization>, 'id' | 'created_at'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IOrganizationUpdate = Pick<IOrganization, 'id'> & Partial<Omit<IOrganization, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IOrganizationDelete = Pick<IOrganization, 'id'>;
export type IOrganizationGet = Pick<IOrganization, 'id'>;

export interface IOrganizationWithRegionCount extends IOrganization {
  regionsCount: number
}


// Create the hooks for 'organizations' table
export const organizationCrud = createCrudHooks<IOrganization, IOrganizationCreate, IOrganizationUpdate>('organizations')