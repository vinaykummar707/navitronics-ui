import { createCrudHooks } from "@/hooks/useCrud";

export interface IOrganization {
    id: string;
    email: string | null;
    logo: string | null;
    name: string;
    phone: string | null;
    deleted: boolean;
    created_at: string;
    active: boolean;
    PIS: boolean;
    PAS: boolean;
    ITMS: boolean;
}

// Create: everything but id, deleted, created_at; all optional except name
export type IOrganizationCreate = Omit<Partial<IOrganization>, 'id' | 'deleted' | 'created_at'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IOrganizationUpdate = Pick<IOrganization, 'id'> & Partial<Omit<IOrganization, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IOrganizationDelete = Pick<IOrganization, 'id'>;
export type IOrganizationGet = Pick<IOrganization, 'id'>;

export interface IOrganizationWithRegionCount extends IOrganization {
  regionsCount: number
}

export interface IOrganizationWithCounts extends IOrganization {
  region_count?: number;
  depot_count?: number;
}


// Create the hooks for 'organizations' table
export const organizationCrud = createCrudHooks<IOrganization, IOrganizationCreate, IOrganizationUpdate>('organizations')

export const getOrgInitials = (name?: string | null): string => {
  if (!name || !name.trim()) return "AG";
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (words.length === 0) {
    const rawClean = name.replace(/[^a-zA-Z0-9]/g, "");
    return rawClean ? rawClean.slice(0, 2).toUpperCase() : "AG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};