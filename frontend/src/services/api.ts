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

// This file contains functions to interact with the backend services for listings and search.
// TODO: Replace direct service URLs with API Gateway once implemented

// Base URL for the listings service
const LISTINGS_SERVICE_URL = process.env.REACT_APP_LISTINGS_SERVICE_URL || 'http://localhost:5001';

// Base URL for the search service
const SEARCH_SERVICE_URL = process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:5003';

// Base URL for the user service
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:5005';


export const listingsApi = {
  // Function to fetch all listings from the listings service
  getListings: async () => {
    const response = await axios.get<{ listings: Listing[] }>(`${LISTINGS_SERVICE_URL}/api/listings/all`);
    return response.data.listings; // Returns an array of Listing objects
  },

  // Function to search listings based on a query string
  searchListings: async (query: string) => {
    const response = await axios.get<Listing[]>(`${SEARCH_SERVICE_URL}/search?q=${query}`);
    return response.data; // Returns an array of Listing objects matching the search query
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

  addToWishlist: async (listingId: string, token: string) => {
    const response = await axios.post(
      `${USER_SERVICE_URL}/wishlist`,
      { listingId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
export const authApi = {
  preRegisterUser: async (request: RegisterRequest): Promise<RegisterResponse | ErrorResponse> => {
    try {
      const response = await axios.post<RegisterResponse>(`${USER_SERVICE_URL}/api/users/pre_register`, request);
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  verifyEmail: async (token: string): Promise<VerificationResponse | ErrorResponse> => {
    try {
      const response = await axios.get<VerificationResponse>(`${USER_SERVICE_URL}/api/users/verify_email/${token}`);
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  resendVerification: async (email: string): Promise<VerificationResponse | ErrorResponse> => {
    try {
      const response = await axios.post<VerificationResponse>(`${USER_SERVICE_URL}/api/users/resend_verification`, { email });
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  loginUser: async (request: LoginRequest): Promise<LoginResponse | ErrorResponse> => {
    try {
      const response = await axios.post<LoginResponse>(`${USER_SERVICE_URL}/api/users/login`, request);
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
        `${USER_SERVICE_URL}/api/users/pre_register/logout`,
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
  isUsernameExisting: async (username: string): Promise<{ exists: boolean } | ErrorResponse> => {
    try {
      const response = await axios.get<{ exists: boolean }>(`${USER_SERVICE_URL}/api/users/is_username_existing`, {
        params: { username },
      });
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  isEmailExisting: async (email: string): Promise<{ exists: boolean } | ErrorResponse> => {
    try {
      const response = await axios.get<{ exists: boolean }>(`${USER_SERVICE_URL}/api/users/is_email_existing`, {
        params: { email },
      });
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },
};
