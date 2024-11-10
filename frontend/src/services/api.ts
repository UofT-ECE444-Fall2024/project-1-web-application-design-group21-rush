import axios from 'axios';
import { Listing } from '../types/listing';
import {
  RegisterRequest,
  RegisterResponse,
  VerificationResponse,
  LoginRequest,
  LoginResponse,
  ErrorResponse,
  LogoutResponse
} from './types';

// Environment variables for URLs
const LISTINGS_SERVICE_URL = process.env.REACT_APP_LISTINGS_SERVICE_URL || 'http://localhost:5000';
const SEARCH_SERVICE_URL = process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:5003';
const AUTH_SERVICE_URL = 'http://localhost:5005'; // Base URL for authentication

// Listings-related API functions
export const listingsApi = {
  getListings: async () => {
    const response = await axios.get<{ listings: Listing[] }>(`${LISTINGS_SERVICE_URL}/api/listings/all`);
    return response.data.listings;
  },

  searchListings: async (query: string) => {
    const response = await axios.get<Listing[]>(`${SEARCH_SERVICE_URL}/search?q=${query}`);
    return response.data;
  },

  createListing: async (listingData: FormData) => {
    const response = await axios.post<Listing>(
      `${LISTINGS_SERVICE_URL}/api/listings/create-listing`,
      listingData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getWishlistItems: async () => {
    const response = await axios.get<Listing[]>(`${LISTINGS_SERVICE_URL}/wishlist`);
    return response.data;
  },

  addToWishlist: async (listingId: string) => {
    const response = await axios.post(`${LISTINGS_SERVICE_URL}/wishlist/${listingId}`);
    return response.data;
  },

  removeFromWishlist: async (listingId: string) => {
    const response = await axios.delete(`${LISTINGS_SERVICE_URL}/wishlist/${listingId}`);
    return response.data;
  },

  getListingById: async (id: string) => {
    const response = await axios.get<{ listing: Listing }>(`${LISTINGS_SERVICE_URL}/api/listings/${id}`);
    return response.data.listing;
  },
};

// Auth-related API functions
export const authApi = {
  preRegisterUser: async (request: RegisterRequest): Promise<RegisterResponse | ErrorResponse> => {
    try {
      const response = await axios.post<RegisterResponse>(`${AUTH_SERVICE_URL}/pre_register`, request);
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  verifyEmail: async (token: string): Promise<VerificationResponse | ErrorResponse> => {
    try {
      const response = await axios.get<VerificationResponse>(`${AUTH_SERVICE_URL}/verify_email/${token}`);
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  resendVerification: async (email: string): Promise<VerificationResponse | ErrorResponse> => {
    try {
      const response = await axios.post<VerificationResponse>(`${AUTH_SERVICE_URL}/resend_verification`, { email });
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  loginUser: async (request: LoginRequest): Promise<LoginResponse | ErrorResponse> => {
    try {
      const response = await axios.post<LoginResponse>(`${AUTH_SERVICE_URL}/login`, request);
      localStorage.setItem('access_token', response.data.access_token); // Store token
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  logoutUser: async (): Promise<LogoutResponse | ErrorResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) return { error: "No token found" };

    try {
      const response = await axios.post<LogoutResponse>(
        `${AUTH_SERVICE_URL}/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem('access_token'); // Clear token on logout
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },
};
