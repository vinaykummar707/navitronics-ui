import axiosInstance from '../config/axios';
import { Area, CreateAreaDto, UpdateAreaDto } from '../types/area';

const BASE_PATH = '/area';

export const areaService = {
  getAll: async (organizationId: string): Promise<Area[]> => {
    const response = await axiosInstance.get(`${BASE_PATH}/getAllActiveAreas/${organizationId}`);
    return response.data['data'];
  },

  create: async (data: CreateAreaDto): Promise<Area> => {
    const response = await axiosInstance.post(`${BASE_PATH}/create`, data);
    return response.data;
  },

  update: async (data: UpdateAreaDto, areaId: string): Promise<Area> => {
    const response = await axiosInstance.patch(`${BASE_PATH}/updateArea/${areaId}`, data);
    return response.data;
  },

  delete: async (areaId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_PATH}/delete/${areaId}`);
  },
};
