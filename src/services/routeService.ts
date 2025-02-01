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
  getRouteWithRouteId: async (routeId: string): Promise<any> => {
    const response = await axiosInstance.get(
      `${BASE_PATH}/getRoutesDisplayConfig/${routeId}`
    );
    return response.data["data"];
  },
  delete: async (routeId: string): Promise<any> => {
    const response = await axiosInstance.delete(`${BASE_PATH}/delete/${routeId}`);
    return response.data;
  },

  generateBitmap: async (text: string, fontFile: string, size: number) => {
    const response = await axiosInstance.get(`${BASE_PATH}/generateBitmap?text=${encodeURIComponent(text)}&fontFile=${fontFile}&size=${size}`);
    return response.data;
  }

};
