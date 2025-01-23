import axiosInstance from '../config/axios';
import { Route } from '../types/route';

const BASE_PATH = '/routes';

export const routeService = {
  getAll: async (organizationId: string,areaId: string, depotId: string): Promise<Route[]> => {
    const response = await axiosInstance.get(`${BASE_PATH}/getAllRoutes?organizationId=${organizationId}&areaId=${areaId}&depotId=${depotId}`);
    return response.data['data'];
  },
};
