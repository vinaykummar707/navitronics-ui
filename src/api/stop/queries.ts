// --- STOP QUERIES ---
export const GET_STOPS = `
  query GetStops($organization_id: uuid!, $depot_id: uuid!) {
    stops(
      where: {
        _and: [
          { organization_id: { _eq: $organization_id } }
          { depot_id: { _eq: $depot_id } }
          { deleted: { _eq: false } }
        ]
      }
    ) {
      id
      name
      created_at
      deleted
      organization_id
      depot_id
      up_latitude
      up_longitude
      down_latitude
      down_longitude
      active
      stop_audios {
        id
        file_name
        url
        file_size
        created_at
        stop_id
        deleted
      }
    }
  }
`;

export const CREATE_STOP = `
  mutation CreateStop(
    $name: String!
    $organization_id: uuid!
    $depot_id: uuid!
    $up_latitude: String!
    $up_longitude: String!
    $down_latitude: String!
    $down_longitude: String!
  ) {
    insert_stops_one(object: {
      name: $name
      organization_id: $organization_id
      depot_id: $depot_id
      up_latitude: $up_latitude
      up_longitude: $up_longitude
      down_latitude: $down_latitude
      down_longitude: $down_longitude
    }) {
      id
      name
      created_at
      deleted
      organization_id
      depot_id
      up_latitude
      up_longitude
      down_latitude
      down_longitude
      active
      stop_audios {
        id
        file_name
        url
        file_size
        created_at
        stop_id
        deleted
      }
    }
  }
`;

export const UPDATE_STOP = `
  mutation UpdateStop(
    $id: uuid!
    $name: String
    $up_latitude: String
    $up_longitude: String
    $down_latitude: String
    $down_longitude: String
  ) {
    update_stops_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        up_latitude: $up_latitude
        up_longitude: $up_longitude
        down_latitude: $down_latitude
        down_longitude: $down_longitude
      }
    ) {
      id
      name
      created_at
      deleted
      organization_id
      depot_id
      up_latitude
      up_longitude
      down_latitude
      down_longitude
      active
    }
  }
`;

export const SOFT_DELETE_STOP = `
  mutation SoftDeleteStop($id: uuid!) {
    update_stops_by_pk(pk_columns: { id: $id }, _set: { deleted: true }) {
      id
      deleted
    }
  }
`;

// --- STOP AUDIO QUERIES ---
export const CREATE_STOP_AUDIO = `
  mutation CreateStopAudio(
    $stop_id: uuid!
    $file_name: String!
    $url: String!
    $file_size: Int!
  ) {
    insert_stop_audios_one(object: {
      stop_id: $stop_id
      file_name: $file_name
      url: $url
      file_size: $file_size
    }) {
      id
      file_name
      url
      file_size
      created_at
      stop_id
      deleted
    }
  }
`;

export const UPDATE_STOP_AUDIO = `
  mutation UpdateStopAudio(
    $id: uuid!
    $file_name: String
    $url: String
    $file_size: Int
  ) {
    update_stop_audios_by_pk(
      pk_columns: { id: $id }
      _set: {
        file_name: $file_name
        url: $url
        file_size: $file_size
      }
    ) {
      id
      file_name
      url
      file_size
      created_at
      stop_id
      deleted
    }
  }
`;

export const SOFT_DELETE_STOP_AUDIO = `
  mutation SoftDeleteStopAudio($id: uuid!) {
    update_stop_audios_by_pk(pk_columns: { id: $id }, _set: { deleted: true }) {
      id
      deleted
    }
  }
`;