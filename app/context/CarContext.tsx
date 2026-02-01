import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CarConfig {
    selectedColor: string;
    selectedColorName: string;
    selectedVehicle: any;
}

interface CarContextType {
    config: CarConfig;
    updateColor: (colorName: string, colorHex: string) => void;
    updateVehicle: (vehicle: any) => void;
}

const defaultConfig: CarConfig = {
    selectedColor: '#FFFFFF',
    selectedColorName: 'White',
    selectedVehicle: null,
};

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<CarConfig>(defaultConfig);

    const updateColor = (colorName: string, colorHex: string) => {
        setConfig(prev => ({
            ...prev,
            selectedColor: colorHex,
            selectedColorName: colorName
        }));
    };

    const updateVehicle = (vehicle: any) => {
        setConfig(prev => ({
            ...prev,
            selectedVehicle: vehicle
        }));
    };

    return (
        <CarContext.Provider value={{ config, updateColor, updateVehicle }}>
            {children}
        </CarContext.Provider>
    );
};

export const useCarContext = () => {
    const context = useContext(CarContext);
    if (!context) {
        throw new Error('useCarContext must be used within a CarProvider');
    }
    return context;
};
