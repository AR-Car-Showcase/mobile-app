import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car, CarImages } from '../types/car';
import { CarData, CarImage } from '../types/api';
import { ApiErrorCode, isApiError } from '../types/errors';
import { apiClient, BASE_URL } from './client';

export const transformCarData = (carData: CarData): Car => {
    const specs: Record<string, Record<string, string>> = {};
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

const CAR_CACHE_KEY = 'carshowcase.cachedCars.v1';
const CAR_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24;

interface CachedCarsPayload {
    savedAt: number;
    cars: Car[];
}

export interface CarsFetchMeta {
    source: 'network' | 'cache';
    backgroundRefreshStarted: boolean;
    cacheAgeMs?: number;
}

let cachedCars: Car[] | null = null;
let cachedCarsPromise: Promise<Car[]> | null = null;

function isCacheFresh(savedAt?: number): boolean {
    if (!savedAt) {
        return false;
    }

    return Date.now() - savedAt < CAR_CACHE_MAX_AGE_MS;
}

async function readPersistedCache(): Promise<CachedCarsPayload | null> {
    try {
        const raw = await AsyncStorage.getItem(CAR_CACHE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw) as CachedCarsPayload;
        if (!parsed?.cars || !Array.isArray(parsed.cars)) {
            return null;
        }

        return parsed;
    } catch {
        return null;
    }
}

async function writePersistedCache(cars: Car[]): Promise<void> {
    const payload: CachedCarsPayload = {
        savedAt: Date.now(),
        cars,
    };

    cachedCars = cars;
    try {
        await AsyncStorage.setItem(CAR_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Best-effort cache only.
    }
}

async function fetchCarsFromServer(): Promise<Car[]> {
    const data = await apiClient.get<CarData[]>('/cars/allcars');
    const adapted = data.map(transformCarData);
    await writePersistedCache(adapted);
    return adapted;
}

function scheduleBackgroundRefresh() {
    if (cachedCarsPromise) {
        return;
    }

    cachedCarsPromise = fetchCarsFromServer()
        .then((cars) => cars)
        .catch((error) => {
            if (isApiError(error)) {
                console.error(`[API] Background refresh failed (${error.code}):`, error.userMessage);
            }

            return cachedCars || [];
        })
        .finally(() => {
            cachedCarsPromise = null;
        });
}

async function getCachedCarsWithMeta(forceRefresh = false): Promise<{ cars: Car[]; meta: CarsFetchMeta } | null> {
    if (!forceRefresh && cachedCars) {
        scheduleBackgroundRefresh();
        return {
            cars: cachedCars,
            meta: {
                source: 'cache',
                backgroundRefreshStarted: true,
            },
        };
    }

    if (!forceRefresh && !cachedCars) {
        const persisted = await readPersistedCache();
        if (persisted?.cars?.length) {
            cachedCars = persisted.cars;
            const cacheAgeMs = persisted.savedAt ? Date.now() - persisted.savedAt : undefined;
            const backgroundRefreshStarted = isCacheFresh(persisted.savedAt);
            if (backgroundRefreshStarted) {
                scheduleBackgroundRefresh();
            }

            return {
                cars: persisted.cars,
                meta: {
                    source: 'cache',
                    backgroundRefreshStarted,
                    cacheAgeMs,
                },
            };
        }
    }

    return null;
}

export const carsApi = {
    getAllCarsWithMeta: async (forceRefresh = false): Promise<{ cars: Car[]; meta: CarsFetchMeta }> => {
        const cached = await getCachedCarsWithMeta(forceRefresh);
        if (cached) {
            return cached;
        }

        const cars = await carsApi.getAllCars(forceRefresh);
        return {
            cars,
            meta: {
                source: 'network',
                backgroundRefreshStarted: false,
            },
        };
    },

    getAllCars: async (forceRefresh = false): Promise<Car[]> => {
        const cached = await getCachedCarsWithMeta(forceRefresh);
        if (cached) {
            return cached.cars;
        }

        if (!forceRefresh && cachedCarsPromise) {
            return cachedCars || await cachedCarsPromise;
        }

        const fetchPromise = (async () => {
            try {
                return await fetchCarsFromServer();
            } catch (error) {
                if (isApiError(error)) {
                    console.error(`[API] Failed to fetch cars (${error.code}):`, error.userMessage);
                }
                if (cachedCars) return cachedCars;
                if (!forceRefresh) {
                    const persisted = await readPersistedCache();
                    if (persisted?.cars?.length) {
                        cachedCars = persisted.cars;
                        return persisted.cars;
                    }
                }
                throw error;
            }
        })();

        cachedCarsPromise = fetchPromise;
        try {
            return await fetchPromise;
        } finally {
            cachedCarsPromise = null;
        }
    },

    getCarsByBodyType: async (bodyType: string): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return allCars.filter(car => car.bodyType.toLowerCase() === bodyType.toLowerCase());
    },

    getCarsByFuelType: async (fuelType: string): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return allCars.filter(car => car.fuelType.toLowerCase() === fuelType.toLowerCase());
    },

    getCarById: async (id: string | number, forceRefresh = false): Promise<Car | null> => {
        if (!forceRefresh && cachedCars) {
            const fromCache = cachedCars.find(car => String(car.id) === String(id));
            if (fromCache) {
                return fromCache;
            }
        }

        try {
            const data = await apiClient.get<CarData>(`/cars/car/${id}`);
            return transformCarData(data);
        } catch (error) {
            if (isApiError(error) && error.code === ApiErrorCode.NOT_FOUND) {
                return null;
            }
            throw error;
        }
    },

    getCarByBrandAndModel: async (brand: string, model: string, forceRefresh = false): Promise<Car | null> => {
        const allCars = await carsApi.getAllCars(forceRefresh);
        const found = allCars.find(car =>
            car.brand.toLowerCase() === brand.toLowerCase() &&
            car.model.toLowerCase() === model.toLowerCase()
        );
        return found || null;
    },

    searchCars: async (query: string): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        const lowerQuery = query.toLowerCase();
        return allCars.filter(car =>
            car.brand.toLowerCase().includes(lowerQuery) ||
            car.model.toLowerCase().includes(lowerQuery) ||
            car.bodyType.toLowerCase().includes(lowerQuery)
        );
    },

    getBodyTypes: async (): Promise<string[]> => {
        const allCars = await carsApi.getAllCars();
        const types = new Set(allCars.map(car => car.bodyType));
        return Array.from(types).sort();
    },

    getFuelTypes: async (): Promise<string[]> => {
        const allCars = await carsApi.getAllCars();
        const types = new Set(allCars.map(car => car.fuelType));
        return Array.from(types).sort();
    },

    getCarsByPriceRange: async (minPrice: number, maxPrice: number): Promise<Car[]> => {
        const allCars = await carsApi.getAllCars();
        return allCars.filter(car => {
            return car.minPriceLakhs >= minPrice && car.maxPriceLakhs <= maxPrice;
        });
    },

    invalidateCache: async (): Promise<void> => {
        cachedCars = null;
        cachedCarsPromise = null;
        try {
            await AsyncStorage.removeItem(CAR_CACHE_KEY);
        } catch {
            // Best-effort cache invalidation.
        }
    },
};

export const {
  getAllCars,
  getAllCarsWithMeta,
  getCarById,
  getCarsByBodyType,
  getCarsByFuelType,
    getCarByBrandAndModel,
    searchCars,
    getBodyTypes,
    getFuelTypes,
    getCarsByPriceRange
} = carsApi;
