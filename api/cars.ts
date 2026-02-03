import { apiClient } from './client';

export interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    image: string;
    category: 'Sedan' | 'SUV' | 'Sports' | 'Luxury' | 'Electric';
    featured?: boolean;
    specs: {
        engine: string;
        power: string;
        acceleration: string;
        topSpeed: string;
    };
}

const MOCK_CARS: Car[] = [
    {
        id: '1',
        make: 'Bugatti',
        model: 'Chiron',
        year: 2022,
        price: 3000000,
        image: 'https://images.unsplash.com/photo-1597687843302-f8c5c4c474d2?q=80&w=1000&auto=format&fit=crop',
        category: 'Sports',
        featured: true,
        specs: {
            engine: '8.0L W16',
            power: '1500 HP',
            acceleration: '2.4s',
            topSpeed: '420 km/h',
        },
    },
    {
        id: '2',
        make: 'Tesla',
        model: 'Model S Plaid',
        year: 2023,
        price: 130000,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop',
        category: 'Electric',
        featured: true,
        specs: {
            engine: 'Tri Motor',
            power: '1020 HP',
            acceleration: '2.1s',
            topSpeed: '322 km/h',
        },
    },
    {
        id: '3',
        make: 'Porsche',
        model: '911 GT3',
        year: 2023,
        price: 170000,
        image: 'https://images.unsplash.com/photo-1611821064562-659715a013a7?q=80&w=1000&auto=format&fit=crop',
        category: 'Sports',
        featured: false,
        specs: {
            engine: '4.0L F6',
            power: '502 HP',
            acceleration: '3.4s',
            topSpeed: '318 km/h',
        },
    },
    {
        id: '4',
        make: 'Lamborghini',
        model: 'Urus',
        year: 2022,
        price: 230000,
        image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop',
        category: 'SUV',
        featured: true,
        specs: {
            engine: '4.0L V8',
            power: '641 HP',
            acceleration: '3.6s',
            topSpeed: '305 km/h',
        },
    },
    {
        id: '5',
        make: 'BMW',
        model: 'M4 Competition',
        year: 2023,
        price: 85000,
        image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1000&auto=format&fit=crop',
        category: 'Sports',
        featured: false,
        specs: {
            engine: '3.0L I6',
            power: '503 HP',
            acceleration: '3.9s',
            topSpeed: '290 km/h',
        },
    },
];

export const carApiMock = {
    getFeaturedCars: async (): Promise<Car[]> => {
        return apiClient.get('/cars/featured').then(() => MOCK_CARS.filter(c => c.featured));
    },

    getAllCars: async (): Promise<Car[]> => {
        return apiClient.get('/cars').then(() => MOCK_CARS);
    },

    searchCars: async (query: string): Promise<Car[]> => {
        const lowerQuery = query.toLowerCase();
        return apiClient.get('/cars/search', { query }).then(() =>
            MOCK_CARS.filter(c =>
                c.make.toLowerCase().includes(lowerQuery) ||
                c.model.toLowerCase().includes(lowerQuery) ||
                c.category.toLowerCase().includes(lowerQuery)
            )
        );
    },

    getCarById: async (id: string): Promise<Car | undefined> => {
        return apiClient.get(`/cars/${id}`).then(() => MOCK_CARS.find(c => c.id === id));
    },
};
