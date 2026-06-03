export enum ApiErrorCode {
    NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
    TIMEOUT = 'TIMEOUT',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
    CONFLICT = 'CONFLICT',
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
    NOT_FOUND = 'NOT_FOUND',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN = 'UNKNOWN',
}

const USER_MESSAGES: Record<ApiErrorCode, string> = {
    [ApiErrorCode.NETWORK_UNAVAILABLE]: 'No internet connection. Please check your network.',
    [ApiErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
    [ApiErrorCode.UNAUTHORIZED]: 'Session expired. Please log in again.',
    [ApiErrorCode.FORBIDDEN]: "You don't have permission to access this.",
    [ApiErrorCode.ACCOUNT_NOT_VERIFIED]: 'Please verify your email address to continue.',
    [ApiErrorCode.CONFLICT]: 'That account already exists or is already in use.',
    [ApiErrorCode.TOO_MANY_REQUESTS]: 'Too many requests. Please wait and try again.',
    [ApiErrorCode.NOT_FOUND]: 'The requested data was not found.',
    [ApiErrorCode.SERVER_ERROR]: 'Something went wrong. Please try again later.',
    [ApiErrorCode.UNKNOWN]: 'An unexpected error occurred.',
};

export class ApiError extends Error {
    readonly code: ApiErrorCode;
    readonly statusCode?: number;
    readonly userMessage: string;
    readonly metadata?: Record<string, any>;

    constructor(code: ApiErrorCode, options?: { statusCode?: number; message?: string; userMessage?: string; metadata?: Record<string, any> }) {
        const developerMessage = options?.message || USER_MESSAGES[code];
        super(developerMessage);
        this.name = 'ApiError';
        this.code = code;
        this.statusCode = options?.statusCode;
        this.userMessage = options?.userMessage || USER_MESSAGES[code];
        this.metadata = options?.metadata;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function getErrorCode(statusCode: number): ApiErrorCode {
    if (statusCode === 401) return ApiErrorCode.UNAUTHORIZED;
    if (statusCode === 403) return ApiErrorCode.FORBIDDEN;
    if (statusCode === 409) return ApiErrorCode.CONFLICT;
    if (statusCode === 429) return ApiErrorCode.TOO_MANY_REQUESTS;
    if (statusCode === 404) return ApiErrorCode.NOT_FOUND;
    if (statusCode >= 500) return ApiErrorCode.SERVER_ERROR;
    return ApiErrorCode.UNKNOWN;
}

export function createNetworkError(originalError: unknown): ApiError {
    if (originalError instanceof ApiError) return originalError;

    const message = originalError instanceof Error ? originalError.message : String(originalError);

    if (message.includes('AbortError') || message.includes('aborted')) {
        return new ApiError(ApiErrorCode.TIMEOUT, { message });
    }

    return new ApiError(ApiErrorCode.NETWORK_UNAVAILABLE, { message });
}
