import { exchangeCodeAsync } from 'expo-auth-session';
import { discovery as googleDiscovery } from 'expo-auth-session/providers/google';

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
