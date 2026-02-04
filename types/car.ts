export interface CarVariant {
    variant: string;
    price: string;
    engine_cc: string;
    fuel: string;
    transmission: string;
    key_specifications: string[];
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
    brand: string;
    model: string;
    body_type: string;
    fuel_type: string;
    transmission_type: string;
    seating_capacity: string;
    price_range: string;
    min_price: string;
    max_price: string;
    rating: string;
    specs: Record<string, any>;
    variants: CarVariant[];
    images: CarImages;
}

export type BodyType = 'SUV' | 'Sedan' | 'Hatchback' | 'MUV' | 'Convertible' | 'Coupe' | 'Minivan' | 'Pickup Truck';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
