export interface User {
    id?: number;
    username: string;
    email: string;
    authProvider?: string;
    profileCompleted?: boolean;
    displayName?: string;
    bio?: string;
    roles?: string[];
    phoneNumber?: string;
    profilePic?: string;
    favBrands?: string[];
    preferredBodyTypes?: string[];
    preferredFuelTypes?: string[];
    preferredTransmissions?: string[];
    drivingCondition?: string;
    maxBudget?: number | null;
    savedCount?: number;
    customizedCount?: number;
}

export interface EmailVerificationResponse {
    message: string;
    verificationRequired: boolean;
    email: string;
    expiresInMinutes: number;
    resendAfterSeconds: number;
}

export interface PasswordResetResponse {
    message: string;
    resetRequired: boolean;
    email: string;
    expiresInMinutes: number;
    resendAfterSeconds: number;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (username: string, password: string) => Promise<User>;
    signInWithGoogle: (idToken: string) => Promise<User>;
    signUp: (username: string, email: string, password: string, phoneNumber?: string, profilePic?: string) => Promise<EmailVerificationResponse>;
    verifyEmail: (email: string, code: string) => Promise<string>;
    resendVerification: (email: string) => Promise<EmailVerificationResponse>;
    signOut: () => Promise<void>;
    token: string | null;
    updateUser: (updatedUser: User) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
    updatePreferences: (updates: Partial<User>) => Promise<User>;
    fetchProfile: (force?: boolean) => Promise<User | null>;
    requestPasswordReset: (email: string) => Promise<PasswordResetResponse>;
    resendPasswordReset: (email: string) => Promise<PasswordResetResponse>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<string>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
}

/** Deep-compare two User objects (ignoring reference identity for array fields). */
const normalizeArray = (values?: string[] | null): string =>
    JSON.stringify([...(values || [])].map((item) => item.trim()).sort());

export const profilesAreEqual = (a: User | null, b: User | null): boolean => {
    if (a === b) return true;
    if (!a || !b) return false;

    return (
        a.id === b.id &&
        a.username === b.username &&
        a.email === b.email &&
        a.authProvider === b.authProvider &&
        a.profileCompleted === b.profileCompleted &&
        a.displayName === b.displayName &&
        a.bio === b.bio &&
        a.phoneNumber === b.phoneNumber &&
        a.profilePic === b.profilePic &&
        a.drivingCondition === b.drivingCondition &&
        a.maxBudget === b.maxBudget &&
        a.savedCount === b.savedCount &&
        a.customizedCount === b.customizedCount &&
        normalizeArray(a.favBrands) === normalizeArray(b.favBrands) &&
        normalizeArray(a.preferredBodyTypes) === normalizeArray(b.preferredBodyTypes) &&
        normalizeArray(a.preferredFuelTypes) === normalizeArray(b.preferredFuelTypes) &&
        normalizeArray(a.preferredTransmissions) === normalizeArray(b.preferredTransmissions)
    );
};
