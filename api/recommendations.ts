import { apiClient } from './client';
import { Car } from '../types/car';
import { CarData } from '../types/api';
import { carsApi, transformCarData } from './cars';

export const recommendationsApi = {
    getGuestRecommendations: async (_country: string = 'US'): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return allCars.filter((c: Car) => c.bodyType === 'SUV').slice(0, 3);
    },

    getUserRecommendations: async (): Promise<Car[]> => {

        try {
            const data = await apiClient.get<CarData[]>('/cars/recommendations/personalized');


            if (!Array.isArray(data)) {
                console.warn('[Recommendation] Unexpected response format:', data);
                return [];
            }

            return data.map(transformCarData);
        } catch (error) {
            console.error('[Recommendation] Failed to fetch personalized recommendations:', error);
            return [];
        }
    },

    getSimilarCars: async (carId: number): Promise<Car[]> => {

        try {
            const data = await apiClient.get<CarData[]>(`/cars/recommendations/${carId}`);


            if (!Array.isArray(data)) {
                console.warn('[Recommendation] Unexpected response format:', data);
                return [];
            }

            return data.map(transformCarData);
        } catch (error) {
            console.error('[Recommendation] Failed to fetch recommendations:', error);
            return [];
        }
    },

    trackInteraction: async (carId: number, action: 'view' | 'click' | 'like' | 'compare'): Promise<void> => {
        try {
            await apiClient.post('/cars/recommendations/feedback', { carId, action });
        } catch (error) {
            console.warn('[Recommendation] Failed to track interaction:', error);
        }
    },
};
