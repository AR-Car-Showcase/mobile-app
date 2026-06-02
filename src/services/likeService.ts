import { apiClient } from '../../api/client';

export interface Car {
    id: string | number;
    name: string;
    brand: string;
    price: string;
    image: string;
    rating?: number;
    description?: string;
    specs?: {
        engine?: string;
        power?: string;
        mileage?: string;
    };
}

export const likeService = {
    likeCar: async (carId: string | number) => {
        return await apiClient.post(`/likes/car/${carId}`, {});
    },

    unlikeCar: async (carId: string | number) => {
        return await apiClient.delete(`/likes/car/${carId}`);
    },

    getMyLikes: async () => {
        return await apiClient.get<Car[]>('/likes/my-likes');
    },

    checkLike: async (carId: string | number) => {
        return await apiClient.get<boolean>(`/likes/check/${carId}`);
    }
};
