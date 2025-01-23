import axiosInstance from '../config/axios';
import { CreateOrganizationDto, Organization, UpdateOrganizationDto } from '../types/organization';

const BASE_PATH = '/organization';

export const organizationService = {
  getAll: async (): Promise<Organization[]> => {
    const response = await axiosInstance.get(`${BASE_PATH}/getOrganizationList`);
    return response.data['data'];
  },

  getById: async (organizationId: string): Promise<Organization> => {
    const response = await axiosInstance.get(`${BASE_PATH}/${organizationId}`);
    return response.data;
  },

  create: async (data: CreateOrganizationDto): Promise<Organization> => {
    const response = await axiosInstance.post(`${BASE_PATH}/create`, data);
    return response.data;
  },

  update: async (data: UpdateOrganizationDto): Promise<Organization> => {
    const response = await axiosInstance.patch(`${BASE_PATH}/update`, data);
    return response.data;
  },

  delete: async (organizationId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_PATH}/deleteOrganization/${organizationId}`);
  },
};
