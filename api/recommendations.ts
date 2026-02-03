import { apiClient } from './client';
import { Car, carApiMock } from './cars';

export const recommendationApiMock = {
    getGuestRecommendations: async (country: string = 'US'): Promise<Car[]> => {
        const allCars = await carApiMock.getAllCars();
        // Simulate recommendation logic based on simple rules
        return apiClient.get('/recommendations/guest', { country }).then(() =>
            allCars.filter(c => c.featured || c.category === 'SUV').slice(0, 3)
        );
    },

    getUserRecommendations: async (): Promise<Car[]> => {
        const allCars = await carApiMock.getAllCars();
        // Simulate personalized ML recommendations
        return apiClient.get('/recommendations/user').then(() =>
            allCars.slice(2, 5) // Return different set
        );
    },
};
