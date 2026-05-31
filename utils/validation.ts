export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

export const isValidUsername = (value: string) => /^[a-zA-Z0-9._]{3,20}$/.test(value.trim());

export const isValidOtp = (value: string, length = 6) => new RegExp(`^\\d{${length}}$`).test(value.trim());

export const isValidPhoneNumber = (value: string) => {
    const trimmed = value.trim();
    return !trimmed || /^\+?[0-9\s-]{7,20}$/.test(trimmed);
};

export const validateStrongPassword = (value: string): string | null => {
    if (value.length < 8) {
        return 'Password must be at least 8 characters long.';
    }

    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
        return 'Password must include uppercase, lowercase, and a number.';
    }

    return null;
};

export const friendlyAuthError = (message?: string, fallback = 'Something went wrong. Please try again.') => {
    const text = (message || '').toLowerCase();
    if (text.includes('username') && text.includes('taken')) {
        return 'That username is already taken. Please choose another one.';
    }
    if (text.includes('email') && (text.includes('already') || text.includes('taken') || text.includes('exists'))) {
        return 'An account with this email already exists. Please sign in instead.';
    }
    if (text.includes('disposable') || text.includes('temporary')) {
        return 'Please use a permanent email address. Temporary email providers are not allowed.';
    }
    if (message && message.trim()) {
        return message;
    }
    return fallback;
};
