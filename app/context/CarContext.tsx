import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Car } from '../../types/car';

export type MaterialColorMap = Record<string, string>;

export interface CarConfig {
    materials: MaterialColorMap;
    selectedVehicle: Car | null;
    showCustomized: boolean;
}

interface CarContextType {
    config: CarConfig;
    updateMaterialColor: (materialName: string, colorHex: string) => void;
    updateVehicle: (vehicle: Car) => void;
    setShowCustomized: (show: boolean) => void;
    resetCustomization: () => void;
}

const DEFAULT_CONFIG: CarConfig = {
    materials: {},
    selectedVehicle: null,
    showCustomized: false,
};

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<CarConfig>(DEFAULT_CONFIG);

    const updateMaterialColor = (materialName: string, colorHex: string) => {
        setConfig(prev => ({
            ...prev,
            showCustomized: true,
            materials: {
                ...prev.materials,
                [materialName]: colorHex,
            }
        }));
    };

    const updateVehicle = (vehicle: Car) => {
        setConfig(prev => ({ ...prev, selectedVehicle: vehicle }));
    };

    const setShowCustomized = (show: boolean) => {
        setConfig(prev => ({ ...prev, showCustomized: show }));
    };

    const resetCustomization = () => {
        setConfig(prev => ({
            ...prev,
            showCustomized: false,
            materials: DEFAULT_CONFIG.materials,
        }));
    };

    return (
        <CarContext.Provider value={{ config, updateMaterialColor, updateVehicle, setShowCustomized, resetCustomization }}>
            {children}
        </CarContext.Provider>
    );
};

export const useCarContext = () => {
    const context = useContext(CarContext);
    if (context === undefined) {
        throw new Error('useCarContext must be used within a CarProvider');
    }
    return context;
};
