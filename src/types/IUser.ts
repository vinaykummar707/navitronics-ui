import { createCrudHooks } from "@/hooks/useCrud";
import { IRegion } from "./IRegion";
import { IRole } from "./role";
import { IDepot } from "./IDepot";
import { IOrganization } from "./organization";

export interface IUser {
    id: string;
    user_id: string;
    email: string | null;
    password: string | null;
    organization_id: string;
    region_id: string | null;
    depot_id: string | null;
    created_at: string;
    active: boolean;
    deleted: boolean;
    role_id: string;
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