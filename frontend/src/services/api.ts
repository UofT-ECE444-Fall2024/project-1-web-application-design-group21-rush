import axios from 'axios';
import { Listing } from '../types/listing';

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
