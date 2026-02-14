import { BASE_URL } from '../api/client';

interface ModelEntry {
    uri: string;
}

export const getRawModelUrl = (filename: string): string => `${BASE_URL}/static/models/${filename}`;

export const CarModels: Record<string, ModelEntry> = {
    'audi-r8.glb': { uri: getRawModelUrl('audi-r8.glb') },
    'bugatti-chiron.glb': { uri: getRawModelUrl('bugatti-chiron.glb') },
    'car.glb': { uri: getRawModelUrl('car.glb') },
    'honda-crv.glb': { uri: getRawModelUrl('honda-crv.glb') },
    'honda-integra.glb': { uri: getRawModelUrl('honda-integra.glb') },
    'mahindra-scorpio-n.glb': { uri: getRawModelUrl('mahindra-scorpio-n.glb') },
    'maruti-baleno.glb': { uri: getRawModelUrl('maruti-baleno.glb') },
    'maruti-brezza.glb': { uri: getRawModelUrl('maruti-brezza.glb') },
    'mercedes-amg-gtr.glb': { uri: getRawModelUrl('mercedes-amg-gtr.glb') },
    'mercedes-s-class.glb': { uri: getRawModelUrl('mercedes-s-class.glb') },
};

export const DEFAULT_MODEL_OBJ: ModelEntry = CarModels['car.glb'];
export const DEFAULT_MODEL_URL: string = getRawModelUrl('car.glb');

export const CONFIGURABLE_MATERIALS: string[] = [
    'CAR_BODY_PRIMARY',
    'CAR_BODY_SECONDARY',
    'CAR_INTERIOR_1',
    'CAR_INTERIOR_2',
    'CAR_INTERIOR_3',
    'CAR_RIM',
    'CARBON_MATERIAL_1',
];
