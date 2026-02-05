export const GET_ORGANIZATIONS = `
  query GetOrganizations {
    organizations {
      id
      email
      logo
      name
      phone
      deleted
      created_at
      active
      PIS
      PAS
      ITMS

      regions_aggregate(where: { deleted: { _eq: false } }) {
        aggregate {
          count
        }
      }
      depots_aggregate(where: { deleted: { _eq: false } }) {
        aggregate {
          count
        }
      }
    }
  }
`;


export const CREATE_ORGANIZATION = `
  mutation CreateOrganization($object: organizations_insert_input!) {
    insert_organizations_one(object: $object) {
      name
      email
      logo
      phone
      PIS
      PAS
      ITMS
    }
  }
`;

export const UPDATE_ORGANIZATION = `
  mutation UpdateOrganization($id: uuid!, $changes: organizations_set_input!) {
    update_organizations_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
      email
      logo
      phone
      active
      created_at
      PIS
      PAS
      ITMS
    }
  }
`;


export const GET_ROLES = `
  query GetRoles {
    roles {
      id
      name
    }
  }
`;