import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  ButtonGroup
} from '@mui/material';
import ListingCard from '../components/listings/ListingCard';
import { Listing } from '../types/listing';
import Header from '../components/layout/Header';
import { listingsApi } from '../services/api';
import { MOCK_USER_INTERESTS } from '../mock/userInterests';
//import { LISTINGS_PER_PAGE } from '../constants/pagination';

const LISTINGS_PER_PAGE = 9; // 3x3 grid 

const Recommended: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('datePosted');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all listings and filter based on user interests
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const data = await listingsApi.getListings();
        setListings(data);

        // Filter listings based on mock user interests
        const recommendedListings = data.filter(listing => 
          MOCK_USER_INTERESTS.includes(listing.category)
        );

        setFilteredListings(recommendedListings);
      } catch (err) {
        console.error('Error fetching recommended listings:', err);
        setError('Failed to fetch recommended listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

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

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredListings.length / LISTINGS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * LISTINGS_PER_PAGE,
    currentPage * LISTINGS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg">
        {/* User Interests and Sort Section */}
        <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Recommended Based on Your Interests
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {MOCK_USER_INTERESTS.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={handleSortChange}>
                  <MenuItem value="datePosted">Most Recent</MenuItem>
                  <MenuItem value="priceLowToHigh">Price: Low to High</MenuItem>
                  <MenuItem value="priceHighToLow">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Recommended Listings Grid */}
        {filteredListings.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {paginatedListings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id}>
                  <ListingCard listing={listing} context="recommended" />
                </Grid>
              ))}
            </Grid>

            {/* Pagination Controls */}
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center" 
              alignItems="center" 
              sx={{ mt: 4, mb: 2 }}
            >
              <ButtonGroup variant="outlined">
                <Button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button disabled>
                  Page {currentPage} of {totalPages}
                </Button>
                <Button 
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </ButtonGroup>
            </Stack>
          </>
        ) : (
          <Paper sx={{ p: 2, mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No listings found matching your interests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try updating your interests or check back later for new listings
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Recommended;
