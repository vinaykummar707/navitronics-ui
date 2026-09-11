import { createCrudHooks } from "@/hooks/useCrud";
import { IRegion } from "./IRegion";
import { IRole } from "./role";
import { IDepot } from "./IDepot";
import { IOrganization } from "./organization";

export interface IUser {
    id: string;
    user_id: string;
    email: string | null;
    password?: string | null;
    organization_id: string;
    region_id: string | null;
    depot_id: string | null;
    created_at: string;
    active: boolean;
    deleted: boolean;
    role_id: string;
    PIS?: boolean | null;
    PAS?: boolean | null;
    ITMS?: boolean | null;
}

export interface ILoggedUser extends IUser {
    region: IRegion | null;
    organization: IOrganization | null;
    depot: IDepot | null;
    role: IRole | null;
}

// Create: everything but id, deleted, created_at; all optional except name
export type IUserCreate = Omit<Partial<IUser>, 'id' | 'deleted' | 'created_at'> ;
export type ILoggedUserCreate = Omit<Partial<IUser>, 'id' | 'deleted' | 'created_at'> ;

// Update: id required, rest optional (except created_at)
export type IUserUpdate = Pick<IUser, 'id'> & Partial<Omit<IUser, 'id' | 'created_at'>>;
export type ILoggedUserUpdate = Pick<IUser, 'id'> & Partial<Omit<IUser, 'id' | 'created_at'>>;

// Delete and Get: only id
export type IUserDelete = Pick<IUser, 'id'>;
export type IUserGet = Pick<IUser, 'id'>;



// Create the hooks for 'users' table
export const userCrud = createCrudHooks<IUser, IUserCreate, IUserUpdate>('users')
export const loggedUserCrud = createCrudHooks<ILoggedUser, ILoggedUserCreate, ILoggedUserUpdate>('users')

export interface IRole  {
    id: string;
    name: string;
}

export const roleCrud = createCrudHooks<IRole, Omit<IRole, 'id'>, Omit<IRole, 'id'>>('roles');

export const getUserInitials = (email?: string | null): string => {
  if (!email) return "OP";
  const namePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
  const parts = namePart.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
};

export const formatRoleName = (roleName?: string | null): string => {
  if (!roleName) return "Operator";
  if (roleName === "master") return "Super Admin";
  return roleName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};


