export interface User {
  userId: string;
  name: string;
  userName: string;
  roleId: string;
  organizationId: string;
  areaId: string;
  depotId: string;
  active: boolean;
  deleted: boolean;
  createdAt: string;
  createdBy: string;
}

export interface CreateUserDto {
  name: string;
  userName: string;
  password: string;
  roleId: string;
  organizationId: string;
  areaId: string;
  depotId: string;
}

export interface UpdateUserDto {
  name: string;
  userName: string;
  roleId: string;
  organizationId: string;
  areaId: string;
  depotId: string;
  active: boolean;
  deleted: boolean;
}
