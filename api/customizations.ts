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
        return apiClient.get<CustomizationResponse[]>('/customizations');
    },

    saveCustomization: async (vehicleId: string, materials: Record<string, string>): Promise<CustomizationResponse> => {
        return apiClient.post<CustomizationResponse>('/customizations', {
            vehicleId,
            materials
        });
    }
};
