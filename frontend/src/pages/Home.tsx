import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  ButtonGroup
} from '@mui/material';
import SearchBar from '../components/search/SearchBar';
import ListingCard from '../components/listings/ListingCard';
import { Listing } from '../types/listing';
import { CATEGORIES } from '../mock/listings';
import Header from '../components/layout/Header';
import { listingsApi } from '../services/api';
import { LISTINGS_PER_PAGE } from '../constants/pagination';

const Home: React.FC = () => {
  // State management
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('datePosted');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch listings when component mounts
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        const data = await listingsApi.getListings();
        console.log('Fetched listings:', data);
        setListings(data);
        setFilteredListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handleLocationChange = (event: any) => {
    setLocation(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
  };

  // Filter effect remains the same but uses real listings instead of mock data
  useEffect(() => {
    let filtered = [...listings];

    if (searchQuery.trim()) {
      filtered = filtered.filter(listing =>
        (listing.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (listing.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    if (priceRange) {
      filtered = filtered.filter(
        listing => (listing.price || 0) >= priceRange[0] && (listing.price || 0) <= priceRange[1]
      );
    }

    if (location) {
      filtered = filtered.filter(listing => listing.location === location);
    }

    if (category) {
      filtered = filtered.filter(listing => listing.category === category);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'datePosted') {
        return new Date(b.datePosted || 0).getTime() - new Date(a.datePosted || 0).getTime();
      }
      return sortBy === 'price' ? (a.price || 0) - (b.price || 0) : 0;
    });

    setFilteredListings(filtered);
  }, [searchQuery, priceRange, location, category, sortBy, listings]);

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
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Container maxWidth="lg">
        {/* Search and Filters Section */}
        <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <SearchBar onSearch={handleSearch} />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={category} onChange={handleCategoryChange}>
                  <MenuItem value="">All Categories</MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <Typography variant="body2" gutterBottom>
                Price Range (${priceRange[0]} - ${priceRange[1]})
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={10}
              />
            </Grid>

            <Grid item xs={12} md={2.25}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select value={location} onChange={handleLocationChange}>
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="St. George">St. George</MenuItem>
                  <MenuItem value="Mississauga">Mississauga</MenuItem>
                  <MenuItem value="Scarborough">Scarborough</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2.25}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select value={sortBy} onChange={handleSortChange}>
                  <MenuItem value="datePosted">Most Recent</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Listings Grid */}
        <Grid container spacing={3}>
          {paginatedListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} context="home" />
            </Grid>
          ))}
        </Grid>

        {/* Pagination Controls */}
        {filteredListings.length > 0 && (
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
        )}

        {/* No Results Message */}
        {filteredListings.length === 0 && (
          <Paper sx={{ p: 2, mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No listings found matching your criteria
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Home;
