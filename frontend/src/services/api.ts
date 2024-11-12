import axios from 'axios';
import { Listing } from '../types/listing';
import { User } from '../types/user';
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
const LISTINGS_SERVICE_URL = process.env.REACT_APP_LISTINGs_SERVICE_URL ||'http://localhost:5001';

// Base URL for the search service
const SEARCH_SERVICE_URL = process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:5003';

// Base URL for the user service
const USER_SERVICE_URL =   process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:5005';


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
    const token = localStorage.getItem('token'); // Get token from localStorage
    const response = await axios.post<Listing>(
      `${LISTINGS_SERVICE_URL}/api/listings/create-listing`,
      listingData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      }
    );
    return response.data;
  },

  getWishlistItems: async (token: string) => {
    const CACHE_TIME = 5000; // 5 seconds
    const cacheKey = 'wishlist-cache';
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_TIME) {
        return data;
      }
    }


    try {
      const response = await axios.get(
        `${USER_SERVICE_URL}/api/users/wishlist/get`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const listingIds = response.data.wishlist || [];
      
      if (listingIds.length === 0) {
        return [];
      }
      

      const listingPromises = listingIds.map((id: string) => 
        listingsApi.getListingById(id)
      );
      
      const listings = await Promise.all(listingPromises);
      
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: listings,
        timestamp: Date.now()
      }));


      return listings;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  addToWishlist: async (listingId: string, token: string) => {
    try {
      const response = await axios.post(
        `${USER_SERVICE_URL}/api/users/wishlist`,
        { listingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (listingId: string, token: string) => {
    try {
      const response = await axios.delete(
        `${USER_SERVICE_URL}/api/users/wishlist/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  getListingById: async (id: string) => {
    const response = await axios.get<{ listing: Listing }>(`${LISTINGS_SERVICE_URL}/api/listings/${id}`);
    return response.data.listing;
  },

  editListing: async (id: string, listingData: FormData) => {
    const response = await axios.put<Listing>(
      `${LISTINGS_SERVICE_URL}/api/listings/edit/${id}`,
      listingData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // deleteListing: async (id: string) => {
  //   const response = await axios.delete(`${LISTINGS_SERVICE_URL}/api/listings/delete/${id}`);
  //   return response.data;
  // },
  deleteListing: async (id: string) => {
    try {
      const response = await axios.delete(`${LISTINGS_SERVICE_URL}/api/listings/delete/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error(axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to delete listing' : 'Failed to delete listing');
    }
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
        `${USER_SERVICE_URL}/api/users/logout`,
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

  getUserId: async (): Promise<string | { error: string }> => {
    const token = localStorage.getItem('access_token');
    if (!token) return { error: 'No token found' };

    try { 
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/user_id`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.user_id;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

  getCurrentUserInfo: async (): Promise<User | null> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.warn('No token found in localStorage');
        return null;
    }

    try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/users/current_user_info`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            console.warn('Token expired or invalid');
            localStorage.removeItem('access_token'); // Clear invalid token
            return null;
        }

        return response.data as User;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
  },

  getUserInfo: async (username: string): Promise<User | null> => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          console.warn('No token found in localStorage');
          return null;
      }
  
      try {
          const response = await axios.get(`${USER_SERVICE_URL}/api/users/user_info/${username}`, 
          {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
  
          if (response.status === 401) {
              console.warn('Token expired or invalid');
              localStorage.removeItem('access_token'); // Clear invalid token
              return null;
          }
  
          return response.data as User;
      } catch (error) {
          console.error('Error fetching user info:', error);
          return null;
      }
    },


  editUser: async (userData: FormData): Promise<{ message: string } | ErrorResponse> => {
    const token = localStorage.getItem('access_token');
    if (!token) return { error: 'No token found' };

    try {
      const response = await axios.post(
        `${USER_SERVICE_URL}/api/users/edit_user`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error) {
      return { error: axios.isAxiosError(error) && error.response ? error.response.data.error : 'Unknown error' };
    }
  },

};

export const userApi = {
  // ... existing methods ...

  getUserProfile: async (token: string) => {
    try {
      const response = await axios.get(
        `${USER_SERVICE_URL}/api/users/current_user_info`,

        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  getUserID: async (token: string) => {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/user_id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user_id;
  },
};
