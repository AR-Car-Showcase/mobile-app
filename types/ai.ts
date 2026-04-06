export type AiDataSourceMode = 'AUTO' | 'DB' | 'JSON';

export interface AiCarContextSummary {
    id: number | null;
    brand: string;
    model: string;
    bodyType: string;
    fuelType: string;
    transmissionType: string;
    minPriceLakhs: number;
    maxPriceLakhs: number;
    rating: number;
}

export interface AiAssistantResponse {
    answer: string;
    model: string;
    dataSource: string;
    carsUsed: AiCarContextSummary[];
}

export interface AiCompareRequest {
    carIds: number[];
    carNames?: string[];
    userNeed?: string;
    dataSource?: AiDataSourceMode;
}

export interface AiRecommendRequest {
    userNeed: string;
    maxCars?: number;
    dataSource?: AiDataSourceMode;
}
