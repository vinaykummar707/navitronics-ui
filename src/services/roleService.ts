
import axiosInstance from '../config/axios';
import { Role, CreateRoleDto, UpdateRoleDto } from '../types/role';

const BASE_PATH = '/roles';

export const roleService = {
  getAll: async (): Promise<Role[]> => {
    const response = await axiosInstance.get(`${BASE_PATH}/active/getAllRoles`);
    return response.data['data'];
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await axiosInstance.post(`${BASE_PATH}/create`, data);
    return response.data;
  },

  update: async (data: UpdateRoleDto, roleId: string): Promise<Role> => {
    const response = await axiosInstance.patch(`${BASE_PATH}/updateRole/${roleId}`, data);
    return response.data;
  },

  delete: async (roleId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_PATH}/delete/${roleId}`);
  },
};
