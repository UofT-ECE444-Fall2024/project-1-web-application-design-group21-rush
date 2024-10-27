import axios from 'axios';
import { Listing } from '../types/listing';

// TODO: Replace direct service URLs with API Gateway once implemented
const LISTINGS_SERVICE_URL = process.env.REACT_APP_LISTINGS_SERVICE_URL || 'http://localhost:5001';
const SEARCH_SERVICE_URL = process.env.REACT_APP_SEARCH_SERVICE_URL || 'http://localhost:5003';

export const listingsApi = {
  getListings: async () => {
    const response = await axios.get<Listing[]>(`${LISTINGS_SERVICE_URL}/listings`);
    return response.data;
  },
  
  searchListings: async (query: string) => {
    const response = await axios.get<Listing[]>(`${SEARCH_SERVICE_URL}/search?q=${query}`);
    return response.data;
  }
};
