import { Car, CarImages } from '../types/car';
import { CarData, CarImage } from '../types/api';
import { apiClient, BASE_URL } from './client';

const adaptBackendCarToFrontend = (carData: CarData): Car => {
    const specs: Record<string, any> = {};
    carData.details.forEach(detail => {
        if (!specs[detail.category]) {
            specs[detail.category] = {};
        }
        specs[detail.category][detail.key] = detail.value;
    });

    const images: CarImages = {
        exterior: [],
        interior: [],
        colours: carData.colors.map(c => ({ name: c.name, image: c.imageUrl })) || []
    };

    carData.images.forEach((img: CarImage) => {
        if (img.type.toLowerCase() === 'exterior') {
            images.exterior.push(img.imageUrl);
        } else if (img.type.toLowerCase() === 'interior') {
            images.interior.push(img.imageUrl);
        }
    });

    if (images.exterior.length === 0) images.exterior.push('https://via.placeholder.com/400x300?text=No+Image');

    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    let model3D = `${base}/static/models/car.glb`;

    if (carData.modelUrl && carData.modelUrl.length > 0) {
        if (carData.modelUrl.startsWith('http')) {
            model3D = carData.modelUrl;
        } else {
            let relativePath = carData.modelUrl;

            if (relativePath.startsWith('/api/')) {
                relativePath = relativePath.substring(5);
            } else if (relativePath.startsWith('api/')) {
                relativePath = relativePath.substring(4);
            }

            if (!relativePath.startsWith('/')) {
                relativePath = '/' + relativePath;
            }

            model3D = `${base}${relativePath}`;
        }
    }

    return {
        id: carData.id,
        brand: carData.brand,
        model: carData.model,
        bodyType: carData.bodyType,
        fuelType: carData.fuelType,
        transmissionType: carData.transmissionType,
        seatingCapacity: carData.seatingCapacity,
        priceRange: carData.priceRange,
        minPriceLakhs: carData.minPriceLakhs,
        maxPriceLakhs: carData.maxPriceLakhs,
        rating: carData.rating,
        specs,
        variants: carData.variants.map(v => ({
            variant: v.variant,
            price: v.price,
            engineCC: v.engineCc,
            fuel: v.fuel,
            transmission: v.transmission,
            mileage: v.mileage,
            keySpecifications: v.keySpecifications || []
        })),
        images,
        model3D
    };
};

let cachedCars: Car[] | null = null;

/**
 * Backend API integration for car data
 */
export const carsApi = {
    /**
     * Get all cars
     */
    getAllCars: async (forceRefresh = false): Promise<Car[]> => {
        if (!forceRefresh && cachedCars) {
            return cachedCars;
        }

        try {
            const data = await apiClient.get<CarData[]>('/cars/allcars');
            const adapted = data.map(adaptBackendCarToFrontend);
            cachedCars = adapted;
            return adapted;
        } catch (error) {
            console.error('[API] Failed to fetch cars:', error);
            return cachedCars || [];
        }
    },

    /**
     * Get cars by body type (SUV, Sedan, Hatchback, etc.)
     */
    getCarsByBodyType: async (bodyType: string): Promise<Car[]> => {
        const data = await apiClient.get<CarData[]>(`/cars/body-type/${bodyType}`);
        return data.map(adaptBackendCarToFrontend);
    },

    /**
     * Get cars by fuel type
     */
    getCarsByFuelType: async (fuelType: string): Promise<Car[]> => {
        const data = await apiClient.get<CarData[]>(`/cars/fuel-type/${fuelType}`);
        return data.map(adaptBackendCarToFrontend);
    },

    /**
     * Get a single car by ID
     */
    getCarById: async (id: string | number): Promise<Car | null> => {
        try {
            const data = await apiClient.get<CarData>(`/cars/car/${id}`);
            return adaptBackendCarToFrontend(data);
        } catch (error) {
            console.error(`[API] Failed to fetch car with id ${id}:`, error);
            return null;
        }
    },

    /**
     * Get a single car by brand and model
     */
    getCarByBrandAndModel: async (brand: string, model: string, forceRefresh = false): Promise<Car | null> => {
        // Optimization: In a real app, we should have a specific endpoint for this
        // For now, we fetch all and find, or we could add a backend endpoint
        const allCars = await carsApi.getAllCars(forceRefresh);
        const found = allCars.find(car =>
            car.brand.toLowerCase() === brand.toLowerCase() &&
            car.model.toLowerCase() === model.toLowerCase()
        );
        return found || null;
    },

    /**
     * Search cars by query (searches brand, model, body_type)
     */
    searchCars: async (query: string): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        const lowerQuery = query.toLowerCase();
        return allCars.filter(car =>
            car.brand.toLowerCase().includes(lowerQuery) ||
            car.model.toLowerCase().includes(lowerQuery) ||
            car.bodyType.toLowerCase().includes(lowerQuery)
        );
    },

    /**
     * Get unique body types
     */
    getBodyTypes: async (): Promise<string[]> => {
        const allCars = await carsApi.getAllCars();
        const types = new Set(allCars.map(car => car.bodyType));
        return Array.from(types).sort();
    },

    /**
     * Get unique fuel types
     */
    getFuelTypes: async (): Promise<string[]> => {
        const allCars = await carsApi.getAllCars();
        const types = new Set(allCars.map(car => car.fuelType));
        return Array.from(types).sort();
    },

    /**
     * Get cars by price range
     */
    getCarsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return allCars.filter(car => {
            return car.minPriceLakhs >= minPrice && car.maxPriceLakhs <= maxPrice;
        });
    }
};

// Export individual methods for convenience
export const {
    getAllCars,
    getCarById,
    getCarsByBodyType,
    getCarsByFuelType,
    getCarByBrandAndModel,
    searchCars,
    getBodyTypes,
    getFuelTypes,
    getCarsByPriceRange
} = carsApi;
