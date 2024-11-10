import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Container, CircularProgress, Alert } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Listing } from '../types/listing';
import { listingsApi } from '../services/api';

const ProductInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await listingsApi.getListingById(id);
        setListing(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to fetch listing details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

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

  if (error || !listing) {
    return (
      <>
        <Header />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Listing not found'}
          </Alert>
        </Container>
      </>
    );
  }

  const getImageUrl = () => {
    if (listing.images && listing.images.length > 0) return listing.images[0];
    if (listing.imageUrl) return listing.imageUrl;
    return '/placeholder-image.jpg';
  };

  return (
    <>
      <Header />
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8} md={8}>
            {/* Image Section */}
            <Box
              component="img"
              src={getImageUrl()}
              alt={listing.title}
              sx={{
                width: '100%',
                height: '70%',
                borderRadius: '8px',
                boxShadow: 2,
                objectFit: 'contain',
              }}
            />
          </Grid>

          <Grid item xs={4} md={4}>
            {/* Side Panel Section - Removed fixed height */}
            <Paper 
              elevation={3} 
              sx={{ 
                padding: 2, 
                minHeight: '70%', // Changed from height to minHeight
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                textAlign: 'left'
              }}
            >
              <Typography variant="h4" gutterBottom>
                <strong>{listing.title}</strong>
              </Typography>

              <Box sx={{ marginBottom: 2 }}>  {/* Increased margin */}
                <Typography variant="h6">
                  <strong>${listing.price.toFixed(2)} </strong>
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 2 }}>  {/* Increased margin */}
                <Typography variant="h6">
                  <strong>Seller:</strong> {listing.sellerName}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 2 }}>  {/* Increased margin */}
                <Typography variant="h6">
                  <strong>Condition:</strong> {listing.condition}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 2 }}>  {/* Increased margin */}
                <Typography variant="h6">
                  <strong>Description:</strong> {listing.description}
                </Typography>
              </Box>

            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProductInfo;