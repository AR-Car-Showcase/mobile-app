import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="(main)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InitialLayout />
        <StatusBar style="light" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
