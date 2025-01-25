import axiosInstance from "../config/axios";
import { Route } from "../types/route";

const BASE_PATH = "/routes";

export const routeService = {
  getAll: async (
    organizationId: string,
    areaId: string,
    depotId: string
  ): Promise<Route[]> => {
    const response = await axiosInstance.get(
      `${BASE_PATH}/getAllRoutes?organizationId=${organizationId}&areaId=${areaId}&depotId=${depotId}`
    );
    return response.data["data"];
  },
  create: async (routeData: any): Promise<any> => {
    const response = await axiosInstance.post(`${BASE_PATH}/create`, routeData);
    return response.data["data"];
  },
  getAllWithConfig: async (depotId: string): Promise<any> => {
    const response = await axiosInstance.get(
      `${BASE_PATH}/getAllRoutesDisplayConfig/${depotId}`
    );
    return response.data["data"];
  },
};
