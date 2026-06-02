import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { carsApi, CarsFetchMeta } from '../../api/cars';
import { Car } from '../../types/car';

type CarCatalogContextType = {
    cars: Car[];
    meta: CarsFetchMeta | null;
    loading: boolean;
    refreshing: boolean;
    loadCatalog: (force?: boolean) => Promise<Car[]>;
    refreshCatalog: () => Promise<Car[]>;
};

const CarCatalogContext = createContext<CarCatalogContextType | undefined>(undefined);

export const CarCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cars, setCars] = useState<Car[]>([]);
    const [meta, setMeta] = useState<CarsFetchMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const inFlightRef = useRef<Promise<Car[]> | null>(null);
    const carsRef = useRef<Car[]>([]);

    const loadCatalog = useCallback(async (force = false): Promise<Car[]> => {
        if (!force && carsRef.current.length > 0) {
            return carsRef.current;
        }

        if (!force && inFlightRef.current) {
            return inFlightRef.current;
        }

        if (force) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        const request = carsApi.getAllCarsWithMeta(force).then((result) => {
            carsRef.current = result.cars;
            setCars(result.cars);
            setMeta(result.meta);
            return result.cars;
        });

        inFlightRef.current = request;

        try {
            return await request;
        } finally {
            inFlightRef.current = null;
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refreshCatalog = useCallback(async () => loadCatalog(true), [loadCatalog]);

    useEffect(() => {
        void loadCatalog(false);
    }, [loadCatalog]);

    return (
        <CarCatalogContext.Provider value={{ cars, meta, loading, refreshing, loadCatalog, refreshCatalog }}>
            {children}
        </CarCatalogContext.Provider>
    );
};

export const useCarCatalog = () => {
    const context = useContext(CarCatalogContext);
    if (!context) {
        throw new Error('useCarCatalog must be used within CarCatalogProvider');
    }
    return context;
};
