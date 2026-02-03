import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import Constants from 'expo-constants';

const safeStorage = {
    getItem: async (key: string) => {
        if (!AsyncStorage) return null;
        try { return await AsyncStorage.getItem(key); } catch { return null; }
    },
    setItem: async (key: string, value: string) => {
        if (!AsyncStorage) return;
        try { await AsyncStorage.setItem(key, value); } catch { }
    },
    removeItem: async (key: string) => {
        if (!AsyncStorage) return;
        try { await AsyncStorage.removeItem(key); } catch { }
    }
};

const API_URL = `${Constants.expoConfig?.extra?.API_URL}/auth`;

interface User {
    username: string;
    email: string;
    roles: string[];
    phoneNumber?: string;
    profilePic?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (username: string, password: string) => Promise<void>;
    signUp: (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => Promise<void>;
    signOut: () => Promise<void>;
    token: string | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await safeStorage.getItem('token');
            const storedUser = await safeStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (username: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const userObj: User = {
                    username: data.username,
                    email: data.email,
                    roles: data.roles,
                    phoneNumber: data.phoneNumber,
                    profilePic: data.profilePic
                };
                setToken(data.token);
                setUser(userObj);
                await safeStorage.setItem('token', data.token);
                await safeStorage.setItem('user', JSON.stringify(userObj));
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signUp = async (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => {
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, phoneNumber, profilePic, role: ['user'] }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await safeStorage.removeItem('token');
        await safeStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!token,
            signIn,
            signUp,
            signOut,
            token
        }}>
            {children}
        </AuthContext.Provider>
    );
};
