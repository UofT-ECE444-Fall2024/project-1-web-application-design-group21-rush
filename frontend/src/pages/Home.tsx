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
import { Listing } from '../types/listing';
import { mockListings } from '../mock/listings';
import Header from '../components/layout/Header';

const Home: React.FC = () => {
  // State management
  const [listings] = useState<Listing[]>(mockListings); // Initialize with mock data directly
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('datePosted');

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter handlers
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handleLocationChange = (event: any) => {
    setLocation(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  // Apply all filters
  useEffect(() => {
    let filtered = [...listings];

    // Apply search filter if exists
    if (searchQuery.trim()) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
      return sortBy === 'price' ? a.price - b.price : 0;
    });

    setFilteredListings(filtered);
  }, [searchQuery, priceRange, location, sortBy, listings]); // Add all dependencies

  return (
    <>
      <Header />
      <Container maxWidth="lg">
        {/* Search and Filters Section */}
        <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar - Takes up 4 columns */}
            <Grid item xs={12} md={4}>
              <SearchBar onSearch={handleSearch} />
            </Grid>

            {/* Price Range - Takes up 3 columns */}
            <Grid item xs={12} md={3}>
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

            {/* Location Dropdown - Takes up 2.5 columns */}
            <Grid item xs={12} md={2.5}>
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

            {/* Sort Dropdown - Takes up 2.5 columns */}
            <Grid item xs={12} md={2.5}>
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
          {filteredListings.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} context="home" />
            </Grid>
          ))}
        </Grid>

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
