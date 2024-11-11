import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, TextField, MenuItem, Select, FormControl, Button, InputLabel, CircularProgress, Container, Alert } from '@mui/material';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Listing } from '../types/listing';
import { listingsApi } from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ProductInfo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedListing, setEditedListing] = useState(listing);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
        return <Navigate to="/" />;
      } finally {
        setIsLoading(false);
      }

      if (!listing) {
        return <Navigate to="/" />;
      }
      setEditedListing(listing);
    };

    fetchListing();
  }, [id]);

 

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

  const LOCATIONS = [
    'St. George',
    'Mississauga',
    'Scarborough'
  ];

  const CATEGORIES = [
    'Books',
    'Clothes',
    'Laptops',
    'Furniture',
    'Electronics',
    'Sports Equipment',
    'Bikes',
    'Collectables',
    'Miscellaneous'
  ];

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImage(file);
      // Create preview URL for immediate display
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (editedListing) {
      setEditedListing({
        ...editedListing,
        imageUrl: url,
        images: [url]
        });
      }
    }
  };

  const handleEditRequest = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editedListing) {
      setEditedListing({
        ...editedListing,
        [field]: event.target.value
      });
    }
  };

  const handleSave = () => {
    if (editedListing && listing) {
      const formData = new FormData();
      // Add each field to formData, rename reserved keywords
      formData.append('title', editedListing.title);
      formData.append('description', editedListing.description);
      formData.append('price', editedListing.price.toString());
      formData.append('location', editedListing.location);
      formData.append('condition', editedListing.condition);
      formData.append('category', editedListing.category);

      if (newImage) {
        formData.append('file', newImage);
      }

      listingsApi.editListing(listing.id, formData);
      setListing(editedListing);
      setPreviewUrl(null)
      setIsEditing(false);
    }
  };


  const handleDelete = () => {
    try {
      listingsApi.deleteListing(listing.id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing');
    }
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
                    <strong>Location:</strong> {listing.location} 
                  </Typography>
                </Box>

                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="h6">
                    <strong>Condition:</strong> {listing.condition} 
                  </Typography>
                </Box>

                <Box sx={{ marginBottom: 1 }}>
                  <Typography variant="h6">
                    <strong>Category:</strong> {listing.category} 
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

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="location-label">Location</InputLabel>
                  <Select
                    labelId="location-label"
                    label="Location"
                    value={editedListing?.location || ''}
                    onChange={(event) => {
                      if (editedListing) {
                        setEditedListing({
                          ...editedListing,
                          location: event.target.value
                        });
                      }
                    }}
                  >
                    {LOCATIONS.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    label="Category"
                    value={editedListing?.category || ''}
                    onChange={(event) => {
                      if (editedListing) {
                        setEditedListing({
                          ...editedListing,
                          category: event.target.value
                        });
                      }
                    }}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
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
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload New Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {previewUrl && (
                    <Box sx={{ mt: 2 }}>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ 
                          width: '100%', 
                          maxHeight: '200px', 
                          objectFit: 'contain' 
                        }} 
                      />
                    </Box>
                  )}
                </Box>
                </>
              )}
              <Box sx={{ marginTop: 'auto', width: '100%', display: 'flex', gap: 2}}>
                {isEditing ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth
                      onClick={() => { handleSave() }}
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
                    onClick={() => { 
                      setIsEditing(true);
                      setEditedListing(listing);
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