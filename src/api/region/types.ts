export interface Region {
  id: string;
  name: string;
  created_at: string;
  deleted: boolean;
  organization_id: string;
  depots_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface GetRegionsResponse {
  regions: Region[];
}

export interface CreateRegionResponse {
  insert_regions_one: Region;
}

export interface CreateRegionVariables {
  name: string;
  organization_id: string;
}

export interface UpdateRegionInput {
  id: string;
  name: string;
}

export interface UpdateRegionResponse {
  update_regions_by_pk: Region;
}

export interface DeleteRegionResponse {
  delete_regions_by_pk: Region;
}
