import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/cars`;

export interface Make {
    make_id: string;
    make_display: string;
    make_is_common: string;
    make_country: string;
}

export interface Model {
    model_name: string;
    model_make_id: string;
}

export interface Trim {
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_body: string;
    model_engine_position: string;
    model_engine_cc: string;
    model_engine_num_cyl: string;
    model_engine_type: string;
    model_engine_valves_per_cyl: string;
    model_engine_power_ps: string;
    model_engine_power_rpm: string;
    model_engine_torque_nm: string;
    model_engine_torque_rpm: string;
    model_engine_bore_mm: string;
    model_engine_stroke_mm: string;
    model_engine_compression: string;
    model_engine_fuel: string;
    model_top_speed_kph: string;
    model_0_to_100_kph: string;
    model_drive: string;
    model_transmission_type: string;
    model_seats: string;
    model_doors: string;
    model_weight_kg: string;
    model_length_mm: string;
    model_width_mm: string;
    model_height_mm: string;
    model_wheelbase_mm: string;
    model_lkm_hwy: string;
    model_lkm_mixed: string;
    model_lkm_city: string;
    model_fuel_cap_l: string;
    model_sold_in_us: string;
    model_co2: string;
    model_make_display: string;
}

export interface Year {
    min_year: string;
    max_year: string;
}

export const carApi = {
    getYears: async (): Promise<Year> => {
        const response = await fetch(`${BASE_URL}/cars/years`);
        if (!response.ok) throw new Error('Failed to fetch years');
        return response.json();
    },

    getMakes: async (year?: number): Promise<Make[]> => {
        const url = year ? `${BASE_URL}/cars/makes?year=${year}` : `${BASE_URL}/cars/makes`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch makes');
        return response.json();
    },

    getModels: async (make: string, year?: number): Promise<Model[]> => {
        const url = year ? `${BASE_URL}/cars/models?make=${make}&year=${year}` : `${BASE_URL}/models?make=${make}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch models');
        return response.json();
    },

    getTrims: async (make: string, model?: string, year?: number): Promise<Trim[]> => {
        let url = `${BASE_URL}/cars/trims?make=${make}`;
        if (model) url += `&model=${model}`;
        if (year) url += `&year=${year}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch trims');
        return response.json();
    },
};
