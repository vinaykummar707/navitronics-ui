export interface Organization {
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
  regions_aggregate: {
    aggregate: {
      count: number;
    };
  };
  depots_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface GetOrganizationsResponse {
  organizations: Organization[];
}


// ...existing Organization type...

export interface CreateOrganizationInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  logo?: string | null;
  PIS?: boolean;
  PAS?: boolean;
  ITMS?: boolean;
  active?: boolean;
}

export interface CreateOrganizationResponse {
  insert_organizations_one: Organization;
}


export interface UpdateOrganizationInput {
  id: string;
  changes: {
    name?: string;
    email?: string | null;
    logo?: string | null;
    phone?: string | null;
    active?: boolean;
    PIS?: boolean;
    PAS?: boolean;
    ITMS?: boolean;
    // Include other updatable fields as needed
  };
}

export interface UpdateOrganizationResponse {
  update_organizations_by_pk: Organization;
}