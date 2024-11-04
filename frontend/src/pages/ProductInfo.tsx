import React from 'react';
import { Box, Grid, Typography, Paper, Container } from '@mui/material';
import { useParams, Navigate } from 'react-router-dom';
import { mockListings } from '../mock/listings';
import Header from '../components/layout/Header';

const ProductInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const listing = mockListings.find(item => item.id === id);

  if (!listing) {
    return <Navigate to="/" />;
  }

  // Transform listing data to match original infoParameters structure
  const infoParameters = [
    { label: 'Product Name', value: listing.title },
    { label: 'Price', value: listing.price.toString() },
    { label: 'User', value: listing.sellerName },
    { label: 'Condition', value: listing.condition },
    { label: 'Description', value: listing.description },
    { label: 'Image', value: listing.imageUrl },
  ];

  return (
    <>
      <Header />
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8} md={8}>
            {/* Image Section */}
            <Box
              component="img"
              src={infoParameters[5].value}
              alt="Small Visual"
              sx={{
                width: '100%',
                height: '70%',
                borderRadius: '8px',
                boxShadow: 2,
              }}
            />
          </Grid>

          <Grid item xs={4} md={4}>
            {/* Side Panel Section */}
            <Paper elevation={3} sx={{ padding: 2, height: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left'}}>
              <Typography variant="h4" gutterBottom>
                <strong>{infoParameters[0].value}</strong>
              </Typography>

              <Box sx={{ marginBottom: 1 }}>
                <Typography variant="h6">
                  <strong>${infoParameters[1].value} </strong>
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 1 }}>
                <Typography variant="h6">
                  <strong>Seller:</strong> {infoParameters[2].value} 
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 1 }}>
                <Typography variant="h6">
                  <strong>Condition:</strong> {infoParameters[3].value} 
                </Typography>
              </Box>

              <Box sx={{ marginBottom: 1 }}>
                <Typography variant="h6">
                  <strong>Description:</strong> {infoParameters[4].value} 
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