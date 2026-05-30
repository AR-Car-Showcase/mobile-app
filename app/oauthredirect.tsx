import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

export default function OAuthRedirectScreen() {
    useEffect(() => {
        router.replace('/auth/login');
    }, []);

    return <View />;
}
