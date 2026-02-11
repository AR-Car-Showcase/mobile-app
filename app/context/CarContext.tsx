import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CarConfig {
    materials: {
        [key: string]: string;
    };
    selectedVehicle: any;
    showCustomized: boolean;
}

interface CarContextType {
    config: CarConfig;
    updateMaterialColor: (materialName: string, colorHex: string) => void;
    updateVehicle: (vehicle: any) => void;
    setShowCustomized: (show: boolean) => void;
    resetCustomization: () => void;
}

const defaultConfig: CarConfig = {
    materials: {
        'CAR_BODY_PRIMARY': '#FFFFFF',
        'CAR_BODY_SECONDARY': '#FFFFFF',
        'CAR_INTERIOR_1': '#FFFFFF',
        'CAR_INTERIOR_2': '#FFFFFF',
        'CAR_INTERIOR_3': '#FFFFFF',
        'CAR_RIM': '#FFFFFF',
        'CARBON_MATERIAL_1': '#FFFFFF',
    },
    selectedVehicle: null,
    showCustomized: false,
};

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<CarConfig>(defaultConfig);

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

    const updateVehicle = (vehicle: any) => {
        setConfig(prev => ({ ...prev, selectedVehicle: vehicle }));
    };

    const setShowCustomized = (show: boolean) => {
        setConfig(prev => ({ ...prev, showCustomized: show }));
    };

    const resetCustomization = () => {
        setConfig(prev => ({
            ...prev,
            showCustomized: false,
            materials: defaultConfig.materials
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
