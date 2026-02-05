export const GET_DEPOTS = `
  query GetDepots($organization_id: uuid!, $region_id: uuid!) {
    depots(
      where: {
        _and: [
          { organization_id: { _eq: $organization_id } }
          { region_id: { _eq: $region_id } }
          { deleted: { _eq: false } }
        ]
      }
    ) {
      id
      name
      created_at
      deleted
      organization_id
      region_id
    }
  }
`;

export const CREATE_DEPOT = `
  mutation CreateDepot($name: String!, $organization_id: uuid!, $region_id: uuid!) {
    insert_depots_one(object: { name: $name, organization_id: $organization_id, region_id: $region_id }) {
      id
      name
      created_at
      deleted
      organization_id
      region_id
    }
  }
`;

export const UPDATE_DEPOT = `
  mutation UpdateDepot($id: uuid!, $name: String!) {
    update_depots_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
      id
      name
      created_at
      deleted
      organization_id
      region_id
    }
  }
`;

export const SOFT_DELETE_DEPOT = `
  mutation SoftDeleteDepot($id: uuid!) {
    update_depots_by_pk(pk_columns: { id: $id }, _set: { deleted: true }) {
      id
      name
      created_at
      deleted
      organization_id
      region_id
    }
  }
`;