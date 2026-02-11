const createWorkerPolyfill = () => {
  return class {
    constructor() { }
    postMessage() { }
    terminate() { }
    addEventListener() { }
    removeEventListener() { }
    onmessage = () => { };
    onerror = () => { };
  };
};

if (typeof global.Worker === 'undefined') {
  // @ts-ignore
  global.Worker = createWorkerPolyfill();
}
if (typeof self !== 'undefined' && typeof (self as any).Worker === 'undefined') {
  (self as any).Worker = global.Worker;
}
if (typeof (global as any).window !== 'undefined' && typeof (global as any).window.Worker === 'undefined') {
  (global as any).window.Worker = global.Worker;
} else if (typeof (global as any).window === 'undefined') {
  // @ts-ignore
  global.window = global;
  // @ts-ignore
  global.window.Worker = global.Worker;
}

import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    </View>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default RootLayout;
