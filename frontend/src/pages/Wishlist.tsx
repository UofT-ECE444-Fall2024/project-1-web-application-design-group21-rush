import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid,
  Typography,
  Paper
} from '@mui/material';
import ListingCard from '../components/listings/ListingCard';
import { listingsApi } from '../services/api';
import { Listing } from '../types/listing';
import { mockWishlistItems } from '../mock/listings';

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    setWishlistItems(mockWishlistItems);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading wishlist...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg">
        <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            My Wishlist
          </Typography>
          {wishlistItems.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Your wishlist is empty. Browse listings and click the heart icon to add items to your wishlist.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </Typography>
          )}
        </Paper>

        <Grid container spacing={3}>
          {wishlistItems.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} context="wishlist" />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Wishlist; 