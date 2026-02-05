import { Car, BodyType } from '../types/car';
import carsData from '../assets/cars_data.json';

const CARS_DATA: Car[] = carsData as unknown as Car[];

/**
 * Mock API for car data - designed for easy backend swap
 */
export const carsApi = {
    /**
     * Get all cars
     */
    getAllCars: async (): Promise<Car[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return CARS_DATA;
    },

    /**
     * Get cars by body type (SUV, Sedan, Hatchback, etc.)
     */
    getCarsByBodyType: async (bodyType: string): Promise<Car[]> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return CARS_DATA.filter(car =>
            car.body_type.toLowerCase() === bodyType.toLowerCase()
        );
    },

    /**
     * Get cars by fuel type
     */
    getCarsByFuelType: async (fuelType: string): Promise<Car[]> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return CARS_DATA.filter(car =>
            car.fuel_type.toLowerCase() === fuelType.toLowerCase()
        );
    },

    /**
     * Get a single car by brand and model
     */
    getCarByBrandAndModel: async (brand: string, model: string): Promise<Car | null> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const found = CARS_DATA.find(car => {
            const brandMatch = car.brand.toLowerCase() === brand.toLowerCase();
            const modelMatch = car.model.toLowerCase() === model.toLowerCase();
            return brandMatch && modelMatch;
        });
        return found || null;
    },

    /**
     * Search cars by query (searches brand, model, body_type)
     */
    searchCars: async (query: string): Promise<Car[]> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const lowerQuery = query.toLowerCase();
        return CARS_DATA.filter(car =>
            car.brand.toLowerCase().includes(lowerQuery) ||
            car.model.toLowerCase().includes(lowerQuery) ||
            car.body_type.toLowerCase().includes(lowerQuery)
        );
    },

    /**
     * Get unique body types
     */
    getBodyTypes: async (): Promise<string[]> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        const types = new Set(CARS_DATA.map(car => car.body_type));
        return Array.from(types).sort();
    },

    /**
     * Get unique fuel types
     */
    getFuelTypes: async (): Promise<string[]> => {
        await new Promise(resolve => setTimeout(resolve, 50));
        const types = new Set(CARS_DATA.map(car => car.fuel_type));
        return Array.from(types).sort();
    },

    /**
     * Get cars by price range
     */
    getCarsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Car[]> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return CARS_DATA.filter(car => {
            return car.min_price_lakhs >= minPrice && car.max_price_lakhs <= maxPrice;
        });
    }
};

// Export individual methods for convenience
export const {
    getAllCars,
    getCarsByBodyType,
    getCarsByFuelType,
    getCarByBrandAndModel,
    searchCars,
    getBodyTypes,
    getFuelTypes,
    getCarsByPriceRange
} = carsApi;
