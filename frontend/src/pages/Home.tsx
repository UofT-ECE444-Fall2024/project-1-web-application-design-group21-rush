import React from 'react';
import { Container, Grid } from '@mui/material';
import SearchBar from '../components/search/SearchBar';

const Home: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <SearchBar />
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {/* Listings will be mapped here */}
      </Grid>
    </Container>
  );
};

export default Home;
