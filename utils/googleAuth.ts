import { exchangeCodeAsync } from 'expo-auth-session';
import { discovery as googleDiscovery } from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type GoogleAuthRequestLike = {
    clientId?: string;
    redirectUri?: string;
    codeVerifier?: string;
    scopes?: string[];
} | null;

type GoogleAuthResultLike = {
    authentication?: {
        idToken?: string | null;
    } | null;
    params?: Record<string, string | undefined>;
} | null;

export async function resolveGoogleIdToken(
    result: GoogleAuthResultLike,
    request: GoogleAuthRequestLike,
): Promise<string | null> {
    const directIdToken =
        result?.authentication?.idToken ||
        result?.params?.id_token ||
        result?.params?.idToken;

    if (directIdToken) {
        return directIdToken;
    }

    const code = result?.params?.code;
    if (!code || !request?.clientId || !request.redirectUri) {
        return null;
    }

    const tokenResponse = await exchangeCodeAsync(
        {
            clientId: request.clientId,
            code,
            redirectUri: request.redirectUri,
            scopes: request.scopes,
            extraParams: request.codeVerifier
                ? { code_verifier: request.codeVerifier }
                : undefined,
        },
        googleDiscovery,
    );

    return tokenResponse.idToken || null;
}

export function getGoogleAndroidRedirectUri(path: string = '/oauthredirect'): string | null {
    if (Platform.OS === 'web') {
        return null;
    }

    const configuredScheme = Constants.expoConfig?.extra?.GOOGLE_ANDROID_REDIRECT_SCHEME;
    if (configuredScheme) {
        return `${configuredScheme}:${path}`;
    }

    const androidClientId = Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    if (!androidClientId) {
        return null;
    }

    const clientIdPrefix = androidClientId.replace(/\.apps\.googleusercontent\.com$/, '');
    const scheme = `com.googleusercontent.apps.${clientIdPrefix}`;

    return `${scheme}:${path}`;
}
