import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Linking } from 'react-native';
import { useAppAlert, useAuth, useAppScale, useTheme } from '../../src/providers';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as ImagePicker from 'expo-image-picker';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { Colors } from '../../constants/Colors';
import { createAuthStyles } from '../../constants/AuthStyles';
import { isApiError } from '../../types/errors';
import { getGoogleAndroidRedirectUri, resolveGoogleIdToken } from '../../utils/googleAuth';
import { SUPPORT_EMAIL } from '../../api/session';
import { friendlyAuthError, isValidEmail, isValidPhoneNumber, isValidUsername, normalizeEmail, validateStrongPassword } from '../../utils/validation';

const SignupScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googlePending, setGooglePending] = useState(false);
    const googleExchangeInFlightRef = useRef(false);
    const consumedGoogleResultKeyRef = useRef<string | null>(null);

    const { signUp, signInWithGoogle, resendVerification } = useAuth();
    const router = useRouter();
    const { colors: Theme, theme } = useTheme();
    const { uiScale } = useAppScale();
    const AuthStyles = useMemo(() => createAuthStyles(Theme, uiScale), [Theme, uiScale]);
    const themedStyles = useMemo(() => createSignupStyles(Theme), [Theme]);
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

        return getGoogleAndroidRedirectUri('/auth/signup') || AuthSession.makeRedirectUri({
            native: `${Constants.expoConfig?.android?.package || 'com.adepusricharan.arcarshowcase'}:/auth/signup`,
        });
    }, []);

    useEffect(() => {
        if (__DEV__) {
            console.log('[GoogleAuth][signup] config', {
                redirectUri,
                hasAndroidClientId: !!googleClientIds.androidClientId,
                hasWebClientId: !!googleClientIds.webClientId,
            });
        }
    }, [redirectUri, googleClientIds.androidClientId, googleClientIds.webClientId]);

    const [googleRequest, googleResult, googlePromptAsync] = Google.useAuthRequest({
        clientId: googleClientIds.expoClientId || googleClientIds.webClientId,
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

        if (googleResult.type === 'dismiss' || googleResult.type === 'cancel') {
            setGooglePending(false);
            setGoogleLoading(false);
            googleExchangeInFlightRef.current = false;
            return;
        }

        if (googleResult.type !== 'success') {
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

        let mounted = true;
        googleExchangeInFlightRef.current = true;
        setGooglePending(false);
        (async () => {
            try {
                if (__DEV__) {
                    console.info('[GoogleAuth][signup] auth result received', {
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
                    console.info('[GoogleAuth][signup] token exchange completed, sending idToken to backend');
                }
                const sessionUser = await signInWithGoogle(idToken);
                if (sessionUser?.profileCompleted === false) {
                    router.replace('/auth/google-username');
                }
            } catch (error: any) {
                if (mounted) {
                    const message = isApiError(error)
                        ? error.userMessage
                        : (error.message || 'Google sign-in is not available yet.');
                    showAlert('Google Sign-In', message);
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
    const googleButtonLayoutStyle = useMemo(() => ({
        minHeight: 54 * uiScale,
        borderRadius: 18 * uiScale,
        gap: 10 * uiScale,
        marginTop: 12 * uiScale,
    }), [uiScale]);
    const googleButtonThemeStyle = useMemo(() => {
        if (theme === 'light') {
            return {
                backgroundColor: Theme.surfaceHighlight,
                borderColor: Theme.border,
                shadowColor: Theme.shadowColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 4,
            };
        }

        return {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            shadowColor: Theme.shadowColor,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 4,
        };
    }, [theme, Theme]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setProfilePic(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSignup = async () => {
        const trimmedUsername = username.trim();
        const trimmedEmail = normalizeEmail(email);
        const trimmedPhone = phoneNumber.trim();

        if (!trimmedUsername || !trimmedEmail || !password) {
            showAlert('Validation Error', 'Please fill in username, email, and password.');
            return;
        }

        if (!isValidUsername(trimmedUsername)) {
            showAlert('Validation Error', 'Username must be 3-20 characters and use only letters, numbers, dots, or underscores.');
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            showAlert('Validation Error', 'Please enter a valid email address.');
            return;
        }

        if (!isValidPhoneNumber(trimmedPhone)) {
            showAlert('Validation Error', 'Please enter a valid phone number or leave it empty.');
            return;
        }

        const passwordError = validateStrongPassword(password);
        if (passwordError) {
            showAlert('Validation Error', passwordError);
            return;
        }

        setLoading(true);
        try {
            const response = await signUp(trimmedUsername, trimmedEmail, password, trimmedPhone || undefined, profilePic || undefined);
            if (response.verificationRequired) {
                showAlert('Check your email', response.message, [
                    {
                        text: 'Continue',
                        onPress: () => router.replace({
                            pathname: '/auth/verify-email',
                            params: { email: response.email },
                        }),
                    },
                ]);
            } else {
                showAlert('Success', response.message, [
                    { text: 'OK', onPress: () => router.replace('/auth/login') }
                ]);
            }
        } catch (error: any) {
            // Check if the email already exists but is unverified
            if (isApiError(error) && error.statusCode === 409) {
                const errorMessage = error.userMessage || error.message || '';
                
                // Check if error mentions unverified account
                if (errorMessage.toLowerCase().includes('not verified') || errorMessage.toLowerCase().includes('verify')) {
                    showAlert(
                        'Account Exists',
                        'An account with this email already exists but has not been verified. We\'ll send a new verification code.',
                        [
                            {
                                text: 'Verify Now',
                                onPress: async () => {
                                    try {
                                        await resendVerification(trimmedEmail);
                                    } catch (resendError) {
                                        // Silent fail
                                    }
                                    
                                    router.replace({
                                        pathname: '/auth/verify-email',
                                        params: { email: trimmedEmail },
                                    });
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ]
                    );
                    return;
                }
            }

            const message = isApiError(error)
                ? friendlyAuthError(error.userMessage, 'Signup failed. Please try again.')
                : (error?.message || 'Something went wrong');
            showAlert('Signup Failed', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (googleLoading || googlePending) {
            return;
        }

        if (!googleRequest) {
            showAlert('Google Sign-In Unavailable', 'Google client IDs are missing from app configuration.');
            return;
        }

        setGoogleLoading(true);
        setGooglePending(true);
        try {
            if (__DEV__) {
                console.info('[GoogleAuth][signup] starting Google prompt');
            }
            await googlePromptAsync();
        } catch (error: any) {
            setGooglePending(false);
            setGoogleLoading(false);
            const message = isApiError(error)
                ? error.userMessage
                : (error.message || 'Google sign-in is not available yet.');
            showAlert('Google Sign-In', message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={AuthStyles.container}
        >
            <TouchableOpacity onPress={() => router.back()} style={AuthStyles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Theme.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={AuthStyles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={AuthStyles.header}>
                    <Text style={AuthStyles.title}>Create Account</Text>
                    <Text style={AuthStyles.subtitle}>Join the AR Car Showcase</Text>
                </View>

                <TouchableOpacity style={styles.profilePicContainer} onPress={pickImage}>
                    {profilePic ? (
                        <Image source={{ uri: profilePic }} style={themedStyles.profilePic} />
                    ) : (
                        <View style={themedStyles.profilePicPlaceholder}>
                            <Ionicons name="camera" size={32} color={Theme.textSecondary} />
                            <Text style={themedStyles.profilePicText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={AuthStyles.inputWrapper}>
                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Username"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="username"
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={AuthStyles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color={Theme.textSecondary} style={AuthStyles.icon} />
                        <TextInput
                            placeholder="Phone Number (Optional)"
                            placeholderTextColor={Theme.textTertiary}
                            style={AuthStyles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
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
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[AuthStyles.button, (!username || !email || !password) && AuthStyles.buttonDisabled]}
                    onPress={handleSignup}
                    disabled={loading || !username || !email || !password}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={AuthStyles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.googleButton,
                        googleButtonLayoutStyle,
                        googleButtonThemeStyle,
                        (!googleRequest || !hasGoogleClientIds || googleLoading) && styles.googleButtonDisabled,
                    ]}
                    onPress={handleGoogleSignup}
                    disabled={!googleRequest || !hasGoogleClientIds || googleLoading}
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

                <Text style={themedStyles.googleHint}>
                    Google sign-in also creates or links your account on first use.
                </Text>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={AuthStyles.linkText}>Already have an account? <Text style={AuthStyles.linkHighlight}>Sign In</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={AuthStyles.linkButton}
                    onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AR%20Car%20Showcase%20account%20help`)}
                >
                    <Text style={AuthStyles.linkText}>
                        Need help? Contact <Text style={AuthStyles.linkHighlight}>{SUPPORT_EMAIL}</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    profilePicContainer: {
        alignSelf: 'center',
        marginBottom: 32,
    },
    googleButton: {
        minHeight: 54,
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        borderRadius: 18,
        borderWidth: 1,
    },
    googleButtonDisabled: {
        opacity: 0.5,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
});

const createSignupStyles = (Theme: typeof Colors.dark) => StyleSheet.create({
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: Theme.accent,
    },
    profilePicPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Theme.glass,
        borderWidth: 1,
        borderColor: Theme.glassBorder,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicText: {
        color: Theme.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    googleHint: {
        color: Theme.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 16,
    },
});
