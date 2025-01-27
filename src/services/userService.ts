import axiosInstance from '../config/axios';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

const BASE_PATH = '/user';

export const userService = {
  getAll: async (organizationId: string): Promise<User[]> => {
    const response = await axiosInstance.get(`${BASE_PATH}/getAllActiveUsers/${organizationId}`);
    return response.data['data'];
  },

  getById: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get(`${BASE_PATH}/getUser/${userId}`);
    return response.data['data'];
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await axiosInstance.post(`${BASE_PATH}/create`, data);
    return response.data;
  },

  update: async (data: UpdateUserDto, userId: string): Promise<User> => {
    const response = await axiosInstance.patch(`${BASE_PATH}/updateUser/${userId}`, data);
    return response.data;
  },

  delete: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_PATH}/delete/${userId}`);
  },
};
