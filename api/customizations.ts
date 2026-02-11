import { apiClient } from './client';

export interface CustomizationResponse {
    customizationId: string;
    modelUrl: string;
    carBrand: string;
    carModel: string;
    carImage: string;
    vehicleId: string;
    materials: string;
}

export const customizationsApi = {

    getUserCustomizations: async (): Promise<CustomizationResponse[]> => {
        try {
            return await apiClient.get<CustomizationResponse[]>('/customizations');
        } catch (error) {
            console.error('[API] Failed to fetch customizations:', error);
            return [];
        }
    },

    saveCustomization: async (vehicleId: string, materials: Record<string, string>): Promise<CustomizationResponse> => {
        try {
            return await apiClient.post<CustomizationResponse>('/customizations', {
                vehicleId,
                materials
            });
        } catch (error) {
            console.error('[API] Failed to save customization:', error);
            throw error;
        }
    }
};
