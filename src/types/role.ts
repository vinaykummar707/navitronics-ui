export interface Role {
  id: string;
  roleName: string;
  active: boolean;
  deleted: boolean;
}

export interface CreateRoleDto {
  roleName: string;
}

export interface UpdateRoleDto {
  roleName: string;
  active: boolean;
  deleted: boolean;
}
