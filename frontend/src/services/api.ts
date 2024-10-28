import axios from 'axios';
import { Listing } from '../types/listing';

// This file contains functions to interact with the backend services for listings and search.
// TODO: Replace direct service URLs with API Gateway once implemented

// Base URL for the listings service
const LISTINGS_SERVICE_URL = process.env.REACT_APP_LISTINGS_SERVICE_URL || 'http://localhost:5001';

// Base URL for the search service
const SEARCH_SERVICE_URL = process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:5003';

export const listingsApi = {
  // Function to fetch all listings from the listings service
  getListings: async () => {
    const response = await axios.get<Listing[]>(`${LISTINGS_SERVICE_URL}/listings`);
    return response.data; // Returns an array of Listing objects
  },
  
  // Function to search listings based on a query string
  searchListings: async (query: string) => {
    const response = await axios.get<Listing[]>(`${SEARCH_SERVICE_URL}/search?q=${query}`);
    return response.data; // Returns an array of Listing objects matching the search query
  }
};
