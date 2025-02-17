import axiosInstance from '../config/axios';
import { Route } from '../types/route';

const BASE_PATH = '/routes';

export const routeService = {
	getAll: async (
		organizationId: string,
		areaId: string,
		depotId: string
	): Promise<Route[]> => {
		const response = await axiosInstance.get(
			`${BASE_PATH}/all?areaId=${areaId}&depotId=${depotId}`
		);
		return response.data;
	},
	create: async (routeData: any): Promise<any> => {
		const response = await axiosInstance.post(`${BASE_PATH}`, routeData);
		return response.data['data'];
	},
	update: async (id: any, routeData: any): Promise<any> => {
		const response = await axiosInstance.put(`${BASE_PATH}/${id}`, routeData);
		return response.data;
	},
	getAllWithConfig: async (
		depotId: string,
		areaId: string,
		selectedIds: string[]
	): Promise<any> => {
		const response = await axiosInstance.get(
			`${BASE_PATH}/export?areaId=${areaId}&depotId=${depotId}&selectedIds=${selectedIds.join(
				','
			)}`,
			{ responseType: 'blob' }
		);
		return response;
	},

	getRouteWithRouteId: async (routeId: string): Promise<any> => {
		const response = await axiosInstance.get(
			`${BASE_PATH}/getRoutesDisplayConfig/${routeId}`
		);
		return response.data['data'];
	},
	delete: async (routeId: string): Promise<any> => {
		const response = await axiosInstance.delete(`${BASE_PATH}/${routeId}`);
		return response.data;
	},

	generateBitmap: async (text: string, fontFile: string, fontSize: number) => {
		let size = 1;
		let desiredHeight = 20;
		if (fontSize === 8) {
			desiredHeight = 12;
			size = 2;
		}
		const response = await axiosInstance.get(
			`${BASE_PATH}/generateBitmap?text=${encodeURIComponent(
				text
			)}&fontFile=${fontFile}&size=${size}&height=${desiredHeight}`
		);
		return response.data;
	},
	generateBitmapSimulation: async (
		text: string,
		fontFile: string,
		fontSize: number
	) => {
		let size = 1;
		let desiredHeight = 20;
		if (fontSize === 8) {
			desiredHeight = 12;
			size = 2;
		}
		const response = await axiosInstance.get(
			`${BASE_PATH}/getBitmapSimulation?text=${encodeURIComponent(
				text
			)}&fontFile=${fontFile}&size=${size}&height=${desiredHeight}`
		);
		return response.data;
	},
};
