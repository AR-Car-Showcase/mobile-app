export interface CarVariant {
    variant: string;
    price: string;
    engineCC: string;
    fuel: string;
    transmission: string;
    mileage: string;
    keySpecifications: string[];
}

export interface CarColour {
    name: string;
    image: string;
}

export interface CarImages {
    exterior: string[];
    interior: string[];
    colours: CarColour[];
}

export interface Car {
    id: number;
    brand: string;
    model: string;
    bodyType: string;
    fuelType: string;
    transmissionType: string;
    seatingCapacity: number;
    priceRange: string;
    minPriceLakhs: number;
    maxPriceLakhs: number;
    rating: number;
    specs: Record<string, any>;
    variants: CarVariant[];
    images: CarImages;
    model3D?: string;
}

export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'MUV' | 'Convertible' | 'Coupe' | 'Minivan' | 'Pickup Truck';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
