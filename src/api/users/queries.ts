export const GET_USER_DETAILS = `
  query GetUserDetails($user_id: uuid!) {
    users_by_pk(user_id: $user_id) {
      user_id
      email
      password
      created_at
      region {
        id
        name
      }
      organization {
        id
        name
      }
      depot {
        id
        name
      }
    role {
        id
        name
      }
    }
  }
`;

//query to get all not deleted users of an organization
export const GET_USERS_BY_ORGANIZATION = `
  query GetUsers($organization_id: uuid!) {
    users(
      where: {
        _and: [
          { organization_id: { _eq: $organization_id } }
          { deleted: { _eq: false } }
        ]
      }
    ) {
      user_id
      email
      password
      created_at
      active
      region {
        id
        name
      }
      organization {
        id
        name
      }
      depot {
        id
        name
      }
      role {
        id
        name
      }
    }
  }
`;


export const CREATE_USER = `
  mutation CreateUser($object: users_insert_input!) {
    insert_users_one(object: $object) {
      userId: user_id
      email: email
      password: password
      regionId: region_id
      organizationId: organization_id
      depotId: depot_id
      roleId: role_id
      password: password
    }
  }
`;