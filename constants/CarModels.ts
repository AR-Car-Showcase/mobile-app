import { BASE_URL } from '../api/client';

// Map of filenames to their remote URLs
// Since our backend now serves these at /api/static/models/
export const getRawModelUrl = (filename: string) => `${BASE_URL}/static/models/${filename}`;

export const CarModels: Record<string, any> = {
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

export const DEFAULT_MODEL_OBJ = CarModels['car.glb'];
export const DEFAULT_MODEL_URL = getRawModelUrl('car.glb');


