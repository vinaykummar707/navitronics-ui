export interface UserArea {
  id: string;
  name: string;
}

export interface UserOrganization {
  id: string;
  name: string;
  PIS: boolean;
  PAS: boolean;
  ITMS: boolean;
  active: boolean;
}

export interface UserDepot {
  id: string;
  name: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface UserDetails {
  user_id: string;
  email: string;
  password: string;
  region: UserArea | null;
  organization: UserOrganization | null;
  depot: UserDepot | null;
  role: UserRole | null;
  created_at?: string;
  active?: boolean;

}

export interface GetUserDetailsResponse {
  users_by_pk: UserDetails | null;
}

export interface GetUserDetailsResponse {
  users_by_pk: UserDetails | null;
}

export interface GetUsersByOrganizationResponse {
  users: UserDetails[];
}