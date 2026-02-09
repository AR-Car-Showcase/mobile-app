export interface CarDetail {
    id: number;
    key: string;
    value: string;
    category: string;
}

export interface CarVariantRaw {
    id: number;
    variant: string;
    price: string;
    engineCc: string;
    fuel: string;
    transmission: string;
    mileage: string;
    keySpecifications: string[];
}

export interface CarImage {
    id: number;
    type: string;
    imageUrl: string;
}

export interface CarColor {
    id: number;
    name: string;
    imageUrl: string;
}

export interface CarData {
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
    modelUrl?: string;
    details: CarDetail[];
    variants: CarVariantRaw[];
    images: CarImage[];
    colors: CarColor[];
}
