import 'expo-dev-client';
import './polyfills';

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppAlertProvider } from './context/AppAlertContext';
import { CarCatalogProvider } from './context/CarCatalogContext';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const routeName = segments.join('/');
    const onGoogleUsernameScreen = routeName === 'auth/google-username';
    const onChangePasswordScreen = routeName === 'auth/change-password';
    const needsProfileCompletion = user?.profileCompleted === false;

    if (!user) {
      if (onChangePasswordScreen) {
        router.replace('/auth/login');
      }
      return;
    }

    if (needsProfileCompletion && !onGoogleUsernameScreen) {
      router.replace('/auth/google-username');
      return;
    }

    if (!needsProfileCompletion && onGoogleUsernameScreen) {
      router.replace('/');
      return;
    }

    if (inAuthGroup && !onChangePasswordScreen && !onGoogleUsernameScreen) {
      router.replace('/');
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
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
        <Stack.Screen name="auth/verify-email" />
        <Stack.Screen name="auth/google-username" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/reset-password" />
        <Stack.Screen name="auth/change-password" />
      </Stack>
    </View>
  );
};

const RootLayout = () => {
  return (
    <ThemeProvider>
      <AppAlertProvider>
        <CarCatalogProvider>
          <AuthProvider>
            <InitialLayout />
          </AuthProvider>
        </CarCatalogProvider>
      </AppAlertProvider>
    </ThemeProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rootContainer: {
    flex: 1,
  },
});
