export const GET_REGIONS = `
  query GetRegions($organization_id: uuid!) {
    regions(
      where: {
        _and: [
          { organization_id: { _eq: $organization_id } }
          { deleted: { _eq: false } }
        ]
      }
    ) {
      id
      name
      created_at
      deleted
      organization_id
      depots_aggregate(where: { deleted: { _eq: false } }) {
        aggregate {
          count
        }
      }
    }
  }
`;

// ... rest remains unchanged

export const CREATE_REGION = `
  mutation CreateRegion($name: String!, $organization_id: uuid!) {
    insert_regions_one(object: { name: $name, organization_id: $organization_id }) {
      id
      name
      created_at
      deleted
      organization_id
    }
  }
`;

export const UPDATE_REGION = `
  mutation UpdateRegion($id: uuid!, $name: String!) {
    update_regions_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
      id
      name
      created_at
      deleted
      organization_id
    }
  }
`;

export const SOFT_DELETE_REGION = `
  mutation SoftDeleteRegion($id: uuid!) {
    update_regions_by_pk(pk_columns: { id: $id }, _set: { deleted: true }) {
      id
      name
      created_at
      deleted
      organization_id
    }
  }
`;
