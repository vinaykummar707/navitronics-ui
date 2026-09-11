import { createCrudHooks } from "@/hooks/useCrud";

export interface IRegion {
  id: string;
  name: string;
  deleted: boolean;
  created_at: string;
  organization_id: string;
}

export interface IRegionWithDepotCount extends IRegion {
  depot_count?: number;
}

// Create: everything but id, deleted, created_at; all optional except name
export type IRegionCreate = Omit<Partial<IRegion>, 'id' | 'deleted' | 'created_at'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IRegionUpdate = Pick<IRegion, 'id'> & Partial<Omit<IRegion, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IRegionDelete = Pick<IRegion, 'id'>;
export type IRegionGet = Pick<IRegion, 'id'>;

// Create the hooks for 'regions' table
export const regionCrud = createCrudHooks<IRegion, IRegionCreate, IRegionUpdate>('regions');

/**
 * Returns 1-2 character uppercase initials from a region name.
 * e.g., "Central Zone" -> "CZ", "North Bangalore" -> "NB", "Hyderabad" -> "HY"
 */
export const getRegionInitials = (name?: string | null): string => {
  if (!name || !name.trim()) return "RG";
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (words.length === 0) {
    const rawClean = name.replace(/[^a-zA-Z0-9]/g, "");
    return rawClean ? rawClean.slice(0, 2).toUpperCase() : "RG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};