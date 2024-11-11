// src/services/types.ts

// Export each type so it can be used in other files
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    wishlist?: string;
    categories?: string;
    location?: string;
}

export interface RegisterResponse {
    message: string;
}

export interface VerificationResponse {
    message: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    message: string;
}

export interface ErrorResponse {
    error: string;
}

export interface LogoutResponse {
    message: string;
}