import { apiClient } from './client';
import { Car } from '../types/car';
import { carsApi } from './cars';

export const recommendationsApi = {
    getGuestRecommendations: async (country: string = 'US'): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return apiClient.get('/recommendations/guest', { country }).then(() =>
            allCars.filter((c: Car) => c.bodyType === 'SUV').slice(0, 3)
        );
    },

    getUserRecommendations: async (): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return apiClient.get('/recommendations/user').then(() =>
            allCars.slice(2, 5)
        );
    },
};
