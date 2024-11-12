import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ListingCard from '../components/listings/ListingCard';
import { Listing } from '../types/listing';
import { listingsApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LISTINGS_PER_PAGE = 9; // 3x3 grid 

const Recommended: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('datePosted');
  const [currentPage, setCurrentPage] = useState(1);
  const [userCategories, setUserCategories] = useState<string[]>([]);
  
  const { getToken, isAuthenticated } = useAuth();

  // Fetch user categories and listings
  useEffect(() => {
    const fetchUserDataAndListings = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        if (!token || !isAuthenticated) {
          throw new Error('Not authenticated');
        }

        // Fetch user info to get categories
        const userInfo = await userApi.getUserProfile(token);
        setUserCategories(userInfo.categories || []);

        // Fetch all listings
        const allListings = await listingsApi.getListings();
        setListings(allListings);

        // Filter listings based on user categories
        const recommendedListings = allListings.filter(listing => 
          userInfo.categories.includes(listing.category)
        );

        setFilteredListings(recommendedListings);
      } catch (err) {
        console.error('Error fetching recommended listings:', err);
        setError('Failed to fetch recommended listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndListings();
  }, [getToken, isAuthenticated]);

  // Sort listings whenever sortBy changes
  useEffect(() => {
    const sortedListings = [...filteredListings].sort((a, b) => {
      if (sortBy === 'datePosted') {
        return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      }
      if (sortBy === 'priceLowToHigh') {
        return a.price - b.price;
      }
      if (sortBy === 'priceHighToLow') {
        return b.price - a.price;
      }
      return 0;
    });

    setFilteredListings(sortedListings);
  }, [sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredListings.length / LISTINGS_PER_PAGE);
  const currentListings = filteredListings.slice(
    (currentPage - 1) * LISTINGS_PER_PAGE,
    currentPage * LISTINGS_PER_PAGE
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Recommended For You
        </Typography>
        
        {userCategories.length > 0 ? (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Based on your interests: {userCategories.join(', ')}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Set your interests in your profile to get personalized recommendations
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="datePosted">Most Recent</MenuItem>
              <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
              <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {currentListings.length === 0 ? (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            No recommended listings found. Try updating your interests or check back later.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {currentListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} context="recommended" />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Recommended;
