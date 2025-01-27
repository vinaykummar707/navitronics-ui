import axiosInstance from '../config/axios';
import { Depot, CreateDepotDto, UpdateDepotDto } from '../types/depot';

const BASE_PATH = '/depots';

export const depotService = {
  getAll: async (areaId: string): Promise<Depot[]> => {
    const response = await axiosInstance.get(`${BASE_PATH}/getAllActiveDepots/${areaId}`);
    return response.data['data'];
  },

  create: async (data: CreateDepotDto): Promise<Depot> => {
    const response = await axiosInstance.post(`${BASE_PATH}/create`, data);
    return response.data;
  },

  update: async (data: any, depotId: string): Promise<any> => {
    const response = await axiosInstance.patch(`${BASE_PATH}/update/${depotId}`, data);
    return response.data;
  },

  delete: async (depotId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_PATH}/delete/${depotId}`);
  },
};
