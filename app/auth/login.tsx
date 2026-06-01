import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { SUPPORT_EMAIL } from '../../api/session';
import { getGoogleAndroidRedirectUri, resolveGoogleIdToken } from '../../utils/googleAuth';
import { useTheme } from '../context/ThemeContext';
import { useAppAlert } from '../context/AppAlertContext';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googlePending, setGooglePending] = useState(false);
    const googleExchangeInFlightRef = useRef(false);
    const consumedGoogleResultKeyRef = useRef<string | null>(null);
    const { signIn, signInWithGoogle } = useAuth();
    const router = useRouter();
    const { colors: Theme } = useTheme();
    const AuthStyles = useMemo(() => createAuthStyles(Theme), [Theme]);
    const showAlert = useAppAlert();
    const googleClientIds = useMemo(() => ({
        expoClientId: Constants.expoConfig?.extra?.GOOGLE_EXPO_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || undefined,
        androidClientId: Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
        iosClientId: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
        webClientId: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
    }), []);

    const redirectUri = useMemo(() => {
        if (Platform.OS === 'web') {
            return undefined;
        }

        return getGoogleAndroidRedirectUri('/auth/login') || AuthSession.makeRedirectUri({
            native: `${Constants.expoConfig?.android?.package || 'com.adepusricharan.arcarshowcase'}:/auth/login`,
        });
    }, []);

    useEffect(() => {
        if (__DEV__) {
            console.log('[GoogleAuth][login] config', {
                redirectUri,
                hasAndroidClientId: !!googleClientIds.androidClientId,
                hasWebClientId: !!googleClientIds.webClientId,
            });
        }
    }, [redirectUri, googleClientIds.androidClientId, googleClientIds.webClientId]);

    const [googleRequest, googleResult, googlePromptAsync] = Google.useAuthRequest({
        expoClientId: googleClientIds.expoClientId,
        androidClientId: googleClientIds.androidClientId,
        iosClientId: googleClientIds.iosClientId,
        webClientId: googleClientIds.webClientId,
        ...(redirectUri ? { redirectUri } : {}),
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        scopes: ['openid', 'profile', 'email'],
    });

    useEffect(() => {
        if (!googlePending || !googleResult) {
            return;
        }

        const resultKey = [
            googleResult.type,
            googleResult.params?.state,
            googleResult.params?.code,
            googleResult.authentication?.idToken,
            googleResult.authentication?.accessToken,
        ].filter(Boolean).join(':');

        if (resultKey && consumedGoogleResultKeyRef.current === resultKey) {
            setGooglePending(false);
            setGoogleLoading(false);
            return;
        }

        if (googleExchangeInFlightRef.current) {
            return;
        }

        consumedGoogleResultKeyRef.current = resultKey || `${googleResult.type}:${Date.now()}`;

        if (googleResult.type === 'dismiss' || googleResult.type === 'cancel') {
            setGooglePending(false);
            setGoogleLoading(false);
            googleExchangeInFlightRef.current = false;
            return;
        }

        let mounted = true;
        googleExchangeInFlightRef.current = true;
        setGooglePending(false);
        (async () => {
            try {
                if (__DEV__) {
                    console.info('[GoogleAuth][login] auth result received', {
                        type: googleResult.type,
                        hasCode: !!googleResult.params?.code,
                        hasIdToken: !!googleResult.authentication?.idToken,
                    });
                }
                const idToken = await resolveGoogleIdToken(googleResult, googleRequest);
                if (!idToken) {
                    throw new Error('Google sign-in did not return an ID token.');
                }
                if (__DEV__) {
                    console.info('[GoogleAuth][login] token exchange completed, sending idToken to backend');
                }
                const sessionUser = await signInWithGoogle(idToken);
                if (sessionUser?.profileCompleted === false) {
                    router.replace('/auth/google-username');
                }
            } catch (error: any) {
                if (mounted) {
                    const message = isApiError(error)
                        ? error.userMessage
                        : (error?.message || 'Please try again.');
                    showAlert('Google Sign-In Failed', message);
                }
            } finally {
                if (mounted) {
                    setGooglePending(false);
                    setGoogleLoading(false);
                }
                googleExchangeInFlightRef.current = false;
            }
        })();

        return () => {
            mounted = false;
        };
    }, [googlePending, googleResult, googleRequest, router, showAlert, signInWithGoogle]);

    const hasGoogleClientIds = !!(googleClientIds.expoClientId || googleClientIds.androidClientId || googleClientIds.iosClientId || googleClientIds.webClientId);
    const canStartGoogleAuth = hasGoogleClientIds;

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            showAlert('Validation Error', 'Please enter your username/email and password.');
            return;
        }

        if (password.length < 8) {
            showAlert('Validation Error', 'Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        try {
            await signIn(username, password);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Check your credentials');
            showAlert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (googleLoading || googlePending) {
            return;
        }

        if (!canStartGoogleAuth) {
            showAlert('Google Sign-In Unavailable', 'Google client IDs are missing from app configuration.');
            return;
        }

        if (!googleRequest) {
            showAlert('Google Sign-In Unavailable', 'Google sign-in is still initializing. Please try again in a moment.');
            return;
        }

        setGoogleLoading(true);
        setGooglePending(true);
        try {
            if (__DEV__) {
                console.info('[GoogleAuth][login] starting Google prompt');
            }
            await googlePromptAsync();
        } catch (error: any) {
            setGooglePending(false);
            setGoogleLoading(false);
            const message = isApiError(error)
                ? error.userMessage
                : (error.message || 'Please try again.');
            showAlert('Google Sign-In Failed', message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={AuthStyles.container}
        >
            <ScrollView contentContainerStyle={AuthStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={AuthStyles.header}>
                    <Text style={AuthStyles.title}>Welcome Back</Text>
                    <Text style={AuthStyles.subtitle}>Sign in to access your Studio</Text>
                </View>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Username or email"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="username"
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[AuthStyles.button, loading && AuthStyles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>
                <Text style={{ color: Theme.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 4 }}>
                    Use your username or email for local sign-in. Google sign-in is available below.
                </Text>

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={[styles.dividerText, { color: Theme.textSecondary }]}>or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={[
                        styles.googleButton,
                        (!canStartGoogleAuth || googleLoading) && styles.googleButtonDisabled,
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={!canStartGoogleAuth || googleLoading}
                >
                    {googleLoading ? (
                        <ActivityIndicator color={Theme.text} />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={18} color={Theme.text} />
                            <Text style={[styles.googleButtonText, { color: Theme.text }]}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text style={AuthStyles.linkText}>Don&apos;t have an account? <Text style={AuthStyles.linkHighlight}>Sign Up</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/forgot-password')}
                >
                    <Text style={AuthStyles.linkText}>Forgot password? <Text style={AuthStyles.linkHighlight}>Reset it</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AR%20Car%20Showcase%20account%20help`)}
                >
                    <Text style={AuthStyles.linkText}>
                        Account issues? Contact <Text style={AuthStyles.linkHighlight}>{SUPPORT_EMAIL}</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = {
    dividerRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 12,
        marginVertical: 20,
        paddingHorizontal: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '600' as const,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },
    googleButton: {
        minHeight: 54,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: 10,
        marginBottom: 8,
    },
    googleButtonDisabled: {
        opacity: 0.5,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700' as const,
    },
};
