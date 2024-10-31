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
  Paper
} from '@mui/material';
import SearchBar from '../components/search/SearchBar';
import ListingCard from '../components/listings/ListingCard';
import { listingsApi } from '../services/api';
import { Listing } from '../types/listing';

// This component represents the home page of the application.
// It implements User Stories 1.1 and 1.2 for searching and filtering listings.

const Home: React.FC = () => {
  // State management
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('datePosted');

  // Fetch listings on component mount
  useEffect(() => {
    console.log('searchQuery: ', searchQuery)
    const fetchListings = async () => {
      try {
        const data = await listingsApi.getListings();
        setListings(data);
        setFilteredListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // TODO: Add error handling UI
      }
    };
    fetchListings();
  }, [searchQuery]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const results = await listingsApi.searchListings(query);
      setFilteredListings(results);
    } catch (error) {
      console.error('Error searching listings:', error);
      // TODO: Add error handling UI
    }
  };

  // Filter handlers
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
    applyFilters();
  };

  const handleLocationChange = (event: any) => {
    setLocation(event.target.value);
    applyFilters();
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
    applyFilters();
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...listings];

    // Apply price filter
    filtered = filtered.filter(
      listing => listing.price >= priceRange[0] && listing.price <= priceRange[1]
    );

    // Apply location filter
    if (location) {
      filtered = filtered.filter(listing => listing.location === location);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'datePosted') {
        return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      }
      return b.price - a.price;
    });

    setFilteredListings(filtered);
  };

  return (
    <Container maxWidth="lg">
      <SearchBar onSearch={handleSearch} />
      
      {/* Filters Section */}
      <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select value={location} onChange={handleLocationChange}>
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="St. George">St. George</MenuItem>
                <MenuItem value="Mississauga">Mississauga</MenuItem>
                <MenuItem value="Scarborough">Scarborough</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
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
        {filteredListings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing.id}>
            <ListingCard listing={listing} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
