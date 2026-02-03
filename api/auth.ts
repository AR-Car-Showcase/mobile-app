import { apiClient } from './client';

export interface Profile {
    id: string;
    username: string;
    email: string;
    phoneNumber?: string;
    profilePic?: string;
    preferences: {
        theme: 'light' | 'dark';
        notifications: boolean;
        favoriteBrands?: string[];
        preferredBodyType?: string[];
    };
}

const MOCK_PROFILE: Profile = {
    id: 'user_123',
    username: 'CarEnthusiast',
    email: 'user@example.com',
    phoneNumber: '+1 555 0199',
    profilePic: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=250&auto=format&fit=crop',
    preferences: {
        theme: 'dark',
        notifications: true,
        favoriteBrands: ['Porsche', 'BMW'],
        preferredBodyType: ['Coupe', 'Sedan'],
    },
};

export const authApiMock = {
    getProfile: async (): Promise<Profile> => {
        return apiClient.get('/user/profile').then(() => MOCK_PROFILE);
    },

    updatePreferences: async (prefs: Partial<Profile['preferences']>): Promise<Profile> => {
        return apiClient.post('/user/preferences', prefs).then(() => ({
            ...MOCK_PROFILE,
            preferences: { ...MOCK_PROFILE.preferences, ...prefs },
        }));
    },
};
