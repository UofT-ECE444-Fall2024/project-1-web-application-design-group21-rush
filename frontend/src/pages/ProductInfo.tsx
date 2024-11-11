import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, TextField, MenuItem, Select, FormControl, Button, InputLabel, CircularProgress, Container, Alert } from '@mui/material';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Listing } from '../types/listing';
import { listingsApi } from '../services/api';
import Header from '../components/layout/Header';

const ProductInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedListing, setEditedListing] = useState<Listing | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await listingsApi.getListingById(id);
        console.log('Fetched listing:', response); // Debug log
        if (response) {
          setListing(response);
          setEditedListing(response);
        } else {
          setError('Listing not found');
        }
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
        {/* <Header /> */}
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
          <Alert severity="error">
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  if (!listing) {
    return <Navigate to="/" />;
  }

  const getImageUrl = () => {
    if (listing.images && listing.images.length > 0) return listing.images[0];
    if (listing.imageUrl) return listing.imageUrl;
    return '/placeholder-image.jpg';
  };

  const CONDITIONS = [
    'New',
    'Like New',
    'Good',
    'Fair',
    'Poor',
  ];

  const handleEditRequest = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editedListing) {
      setEditedListing({
        ...editedListing,
        [field]: event.target.value
      });
    }
  };

  return (
    <>
      {/* <Header /> */}
      <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={8} md={8}>
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
            <Paper 
              elevation={3} 
              sx={{ 
                padding: 2, 
                minHeight: '70%',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start', 
                textAlign: 'left'
              }}
            >
              {!isEditing ? (
                <>
                  <Typography variant="h4" gutterBottom>
                    <strong>{listing.title}</strong>
                  </Typography>

                  <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="h6">
                      <strong>${typeof listing.price === 'number' ? listing.price.toFixed(2) : listing.price}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 1 }}>
                    <Typography variant="h6">
                      <strong>Seller:</strong> {listing.sellerName || 'Anonymous'}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 1 }}>
                    <Typography variant="h6">
                      <strong>Condition:</strong> {listing.condition}
                    </Typography>
                  </Box>

                  <Box sx={{ marginBottom: 1 }}>
                    <Typography variant="h6">
                      <strong>Description:</strong> {listing.description}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <TextField
                    fullWidth size="small"
                    label="Listing Title"
                    variant="outlined"
                    value={editedListing?.title || ''}
                    onChange={handleEditRequest('title')}
                    InputLabelProps={{ style: { fontWeight: 'bold'} }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth size="small"
                    label="Price"
                    variant="outlined"
                    value={editedListing?.price || ''}
                    type="number"
                    onChange={handleEditRequest('price')}
                    InputLabelProps={{ style: { fontWeight: 'bold'} }}
                    sx={{ mb: 2 }}
                    inputProps={{ min: 0 }}  
                  />

                  <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="h6">
                      <strong>Seller:</strong> {editedListing?.sellerName} 
                    </Typography>
                  </Box>

                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="condition-label">Condition</InputLabel>
                    <Select
                      labelId="condition-label"
                      label="Condition"
                      value={editedListing?.condition || ''}
                      onChange={(event) => {
                        if (editedListing) {
                          setEditedListing({
                            ...editedListing,
                            condition: event.target.value
                          });
                        }
                      }}
                    >
                      {CONDITIONS.map((condition) => (
                        <MenuItem key={condition} value={condition}>
                          {condition}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth size="small"
                    label="Description"
                    variant="outlined"
                    value={editedListing?.description || ''}
                    onChange={handleEditRequest('description')}
                    InputLabelProps={{ style: { fontWeight: 'bold'} }}
                    sx={{ mb: 2 }}
                  />
                </>
              )}
              <Box sx={{ marginTop: 'auto', width: '100%', display: 'flex', gap: 2}}>
                {isEditing ? (
                  <Button 
                    variant="contained" 
                    color="success" 
                    fullWidth
                    onClick={() => { 
                      if (editedListing) {
                        setListing(editedListing);
                        setIsEditing(false);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                ) : ( 
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Listing
                    </Button>

                    <Button 
                      variant="contained" 
                      color="error" 
                      fullWidth
                      onClick={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete functionality to be implemented');
                      }}
                    >
                      Delete Listing
                    </Button>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProductInfo;