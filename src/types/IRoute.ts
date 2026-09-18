import { createCrudHooks } from "@/hooks/useCrud";

export interface IRoute {
  id: string;
  route_number: string;
  source: string;
  destination: string;
  separation: string;
  via: string;
  route_number_1: string;
  route_number_2: string;
  is_split_route: boolean;
  front: string;
  side: string;
  rear: string;
  internal: string;
  stops: string;
  deleted: boolean;
  created_at: string;
  organization_id?: string | null;
  depot_id?: string | null;
  version: string;
  return: boolean;
  created_by: string;
  created_by_user?: {
    email: string;
  };
}

// Create: everything but id, deleted, created_at; all optional except name
export type IRouteCreate = Omit<
  Partial<IRoute>,
  "id" | "deleted" | "created_at"
>;

// Update: id required, rest optional (except created_at)
export type IRouteUpdate = Pick<IRoute, "id"> &
  Partial<Omit<IRoute, "id" | "created_at">>;

// Delete and Get: only id
export type IRouteDelete = Pick<IRoute, "id">;
export type IRouteGet = Pick<IRoute, "id">;

// Create the hooks for 'routes' table
export const routeCrud = createCrudHooks<IRoute, IRouteCreate, IRouteUpdate>(
  "routes",
);
