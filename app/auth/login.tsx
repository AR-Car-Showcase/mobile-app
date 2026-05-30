import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { Colors } from '../../constants/Colors';
import { AuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { fetchGoogleAuthConfig, GoogleAuthConfig } from '../../api/session';
import { resolveGoogleIdToken } from '../../utils/googleAuth';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googlePending, setGooglePending] = useState(false);
    const [googleConfig, setGoogleConfig] = useState<GoogleAuthConfig | null>(null);
    const { signIn, signInWithGoogle } = useAuth();
    const router = useRouter();
    const Theme = Colors.dark;
    const googleClientIds = useMemo(() => ({
        expoClientId: Constants.expoConfig?.extra?.GOOGLE_EXPO_CLIENT_ID || undefined,
        androidClientId: Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID || undefined,
        iosClientId: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID || undefined,
        webClientId: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID || undefined,
    }), []);

    const redirectUri = useMemo(() => {
        if (Platform.OS === 'web') {
            return undefined;
        }

        return AuthSession.makeRedirectUri({
            native: `${Constants.expoConfig?.android?.package || 'com.adepusricharan.arcarshowcase'}:/oauthredirect`,
        });
    }, []);

    useEffect(() => {
        if (__DEV__ && redirectUri) {
            console.log('[GoogleAuth] redirectUri:', redirectUri);
        }
    }, [redirectUri]);

    const [googleRequest, googleResult, googlePromptAsync] = Google.useAuthRequest({
        expoClientId: googleClientIds.expoClientId,
        androidClientId: googleClientIds.androidClientId,
        iosClientId: googleClientIds.iosClientId,
        webClientId: googleClientIds.webClientId,
        ...(redirectUri ? { redirectUri } : {}),
        scopes: ['openid', 'profile', 'email'],
    });

    useEffect(() => {
        if (!googlePending || !googleResult) {
            return;
        }

        if (googleResult.type === 'dismiss' || googleResult.type === 'cancel') {
            setGooglePending(false);
            setGoogleLoading(false);
            return;
        }

        let mounted = true;
        (async () => {
            try {
                const idToken = await resolveGoogleIdToken(googleResult, googleRequest);
                if (!idToken) {
                    throw new Error('Google sign-in did not return an ID token.');
                }
                await signInWithGoogle(idToken);
            } catch (error: any) {
                if (mounted) {
                    Alert.alert('Google Sign-In Failed', error?.message || 'Please try again.');
                }
            } finally {
                if (mounted) {
                    setGooglePending(false);
                    setGoogleLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [googlePending, googleResult, googleRequest, signInWithGoogle]);

    useEffect(() => {
        let mounted = true;

        fetchGoogleAuthConfig().then((config) => {
            if (mounted) {
                setGoogleConfig(config);
            }
        }).catch(() => {
            if (mounted) {
                setGoogleConfig(null);
            }
        });

        return () => {
            mounted = false;
        };
    }, []);

    const isGoogleEnabled = !!googleConfig?.enabled;
    const hasGoogleClientIds = !!(googleClientIds.expoClientId || googleClientIds.androidClientId || googleClientIds.iosClientId || googleClientIds.webClientId);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Validation Error', 'Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            await signIn(username, password);
        } catch (error: any) {
            const message = isApiError(error)
                ? error.userMessage
                : (error?.message || 'Check your credentials');
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!isGoogleEnabled) {
            Alert.alert('Google Sign-In Unavailable', 'Please try username/password login for now.');
            return;
        }

        if (!hasGoogleClientIds || !googleRequest) {
            Alert.alert('Google Sign-In Unavailable', 'Google client IDs are missing from app configuration.');
            return;
        }

        setGoogleLoading(true);
        setGooglePending(true);
        try {
            await googlePromptAsync();
        } catch (error: any) {
            setGooglePending(false);
            setGoogleLoading(false);
            Alert.alert('Google Sign-In Failed', error.message || 'Please try again.');
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
                        (!isGoogleEnabled || !hasGoogleClientIds || !googleRequest || googleLoading) && styles.googleButtonDisabled,
                    ]}
                    onPress={handleGoogleLogin}
                    disabled={!isGoogleEnabled || !hasGoogleClientIds || !googleRequest || googleLoading}
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
                    onPress={() => router.push('/auth/verify-email')}
                >
                    <Text style={AuthStyles.linkText}>Already signed up? <Text style={AuthStyles.linkHighlight}>Verify Email</Text></Text>
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
