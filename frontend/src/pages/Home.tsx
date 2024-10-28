import React from 'react';
import { Container, Grid } from '@mui/material';
import SearchBar from '../components/search/SearchBar';

// This component represents the home page of the application.
// It includes a search bar and a grid for displaying listings.

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg"> {/* Sets the maximum width of the container */}
      <SearchBar /> {/* Search bar component */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {/* Listings will be mapped here */}
      </Grid>
    </Container>
  );
};

export default Home;
