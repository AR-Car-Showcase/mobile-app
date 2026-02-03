const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
    get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
        console.log(`[GET] ${endpoint}`, params);
        await delay(500);
        return {} as T;
    },
    post: async <T>(endpoint: string, data?: any): Promise<T> => {
        console.log(`[POST] ${endpoint}`, data);
        await delay(800);
        return {} as T;
    },
};
