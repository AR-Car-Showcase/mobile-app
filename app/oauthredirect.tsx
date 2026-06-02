import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/providers';

export default function OAuthRedirectScreen() {
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) {
            return;
        }

        const target = !user
            ? '/auth/login'
            : user.profileCompleted === false
                ? '/auth/google-username'
                : '/';

        const timeout = setTimeout(() => {
            router.replace(target);
        }, 120);

        return () => clearTimeout(timeout);
    }, [isLoading, user]);

    return <View />;
}
