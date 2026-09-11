import { createCrudHooks } from "@/hooks/useCrud";

export interface IDepot {
  id: string;
  name: string;
  deleted: boolean;
  created_at: string;
  organization_id: string;
  region_id: string;
}

export interface IDepotWithRouteCount extends IDepot {
  route_count?: number;
  region_name?: string;
}

// Create: everything but id, deleted, created_at; all optional except name
export type IDepotCreate = Omit<Partial<IDepot>, 'id' | 'deleted' | 'created_at'> & { name: string };

// Update: id required, rest optional (except created_at)
export type IDepotUpdate = Pick<IDepot, 'id'> & Partial<Omit<IDepot, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IDepotDelete = Pick<IDepot, 'id'>;
export type IDepotGet = Pick<IDepot, 'id'>;

// Create the hooks for 'depots' table
export const depotCrud = createCrudHooks<IDepot, IDepotCreate, IDepotUpdate>('depots');

/**
 * Returns 1-2 character uppercase initials from a depot name.
 * e.g., "Kengeri Depot" -> "KD", "Central Depot" -> "CD", "Majestic" -> "MA"
 */
export const getDepotInitials = (name?: string | null): string => {
  if (!name || !name.trim()) return "DP";
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (words.length === 0) {
    const rawClean = name.replace(/[^a-zA-Z0-9]/g, "");
    return rawClean ? rawClean.slice(0, 2).toUpperCase() : "DP";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};