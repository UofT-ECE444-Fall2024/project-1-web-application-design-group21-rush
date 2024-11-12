import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Listing } from '../types/listing';
import { listingsApi } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: Listing[];          // Array of listings in the wishlist
  isWishlistLoading: boolean;        // Loading state for wishlist operations
  isItemWishlisted: (listingId: string) => boolean;  // Check if an item is in wishlist
  addToWishlist: (listing: Listing) => Promise<void>; // Add item to wishlist
  removeFromWishlist: (listingId: string) => Promise<void>; // Remove item from wishlist
  refreshWishlist: () => Promise<void>; // Force refresh the wishlist data
}

// Create the context with undefined default value
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// WishlistProvider component that manages wishlist state and operations
//This provider should wrap any components that need access to wishlist functionality
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state management
  const [wishlistItems, setWishlistItems] = useState<Listing[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  // Get authentication utilities from AuthContext
  const { isAuthenticated, getToken } = useAuth();

 // Fetches and updates the wishlist items from the server. This is memoized to prevent unnecessary recreations
  const refreshWishlist = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setIsWishlistLoading(true);
      const items = await listingsApi.getWishlistItems(token);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  }, [isAuthenticated, getToken]);

// Checks if a specific item is in the wishlist. Memorized to prevent unnecessary recreations on each render
  const isItemWishlisted = useCallback((listingId: string) => {
    return wishlistItems.some(item => item.id === listingId);
  }, [wishlistItems]);

//Adds an item to the wishlist. Updates both server and local state
  const addToWishlist = useCallback(async (listing: Listing) => {
    const token = getToken();
    if (!token) return;

    try {
      // Make API call to add item to wishlist
      await listingsApi.addToWishlist(listing.id, token);
      // Optimistically update local state
      setWishlistItems(prev => [...prev, listing]);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  }, [getToken]);

  
  //Removes an item from the wishlist. Updates both server and local state
  const removeFromWishlist = useCallback(async (listingId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      // Make API call to remove item from wishlist
      await listingsApi.removeFromWishlist(listingId, token);
      // Optimistically update local state
      setWishlistItems(prev => prev.filter(item => item.id !== listingId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  }, [getToken]);

  // Effect to refresh wishlist when authentication status changes. This ensures wishlist is up-to-date when user logs in/out
  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  // Provide the wishlist context to children components
  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isWishlistLoading,
      isItemWishlisted,
      addToWishlist,
      removeFromWishlist,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

//Custom hook to use the wishlist context
//Throws an error if used outside of WishlistProvider
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 