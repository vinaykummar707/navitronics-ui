export interface Depot {
  id: string;
  name: string;
  created_at: string;
  deleted: boolean;
  organization_id: string;
  region_id: string;
}

export interface GetDepotsResponse {
  depots: Depot[];
}

export interface CreateDepotResponse {
  insert_depots_one: Depot;
}

export interface CreateDepotVariables {
  name: string;
  organization_id: string;
  region_id: string;
}

export interface UpdateDepotInput {
  id: string;
  name: string;
}

export interface UpdateDepotResponse {
  update_depots_by_pk: Depot;
}

export interface DeleteDepotResponse {
  delete_depots_by_pk: Depot;
}