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
  const [editedListing, setEditedListing] = useState(listing);
  const navigate = useNavigate();

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

  if (!listing) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <>
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
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

  const handleDelete = () => {
    navigate('/');
  };

  
  return (
    <>
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
              {!isEditing ? (
                <>
              <Typography variant="h4" gutterBottom>
                <strong>{listing.title}</strong>
              </Typography>

              <Box sx={{ marginBottom: 2 }}>  {/* Increased margin */}
                <Typography variant="h6">
                  <strong>${listing.price.toFixed(2)} </strong>
                </Typography>
                </Box>

                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="h6">
                    <strong>Seller:</strong> {listing.sellerName} 
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
              ):(
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
                  <>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth
                      onClick={() => { 
                      if (editedListing && listing) {
                        // Update the listing with all the edited values
                        // mockListings[listingIndex] = editedListing;
                        setIsEditing(false);
                      }
                      }}
                    >
                      Save Changes
                    </Button>
                  </>
                ):( 
                  <>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => { setIsEditing(true)
                    }}
                  >
                    Edit Listing
                  </Button>

                  <Button 
                    variant="contained" 
                    color="error" 
                    fullWidth
                    onClick={() => {
                      handleDelete()
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