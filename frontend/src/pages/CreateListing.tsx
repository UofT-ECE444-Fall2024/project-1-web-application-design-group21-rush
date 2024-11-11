import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  ImageList,
  ImageListItem,
  IconButton,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { listingsApi, authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateListing: React.FC = () => {
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    condition: '',
    images: [] as File[],
    category: ''
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListing({
      ...listing,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (e: any) => {
    setListing({
      ...listing,
      location: e.target.value
    });
  };

  const handleCategoryChange = (e: any) => {
    setListing({
      ...listing,
      category: e.target.value
    });
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      setListing(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));
      
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add basic listing data
      formData.append('id', crypto.randomUUID()); // Generate a unique ID
      formData.append('title', listing.title);
      formData.append('description', listing.description);
      formData.append('price', listing.price);
      formData.append('location', listing.location);
      formData.append('condition', listing.condition);
      formData.append('category', listing.category);
      formData.append('datePosted', new Date().toISOString());
      
      // TODO: Get these from auth context once implemented
      try {
        const userId = await authApi.getUserId();
        if (typeof userId === 'string') {
          formData.append('sellerId', userId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }

      formData.append('sellerName', 'Temporary User');

      // Add all images
      listing.images.forEach((file) => {
        formData.append('file', file);
      });

      await listingsApi.createListing(formData);
      
      // Redirect to home page after successful creation
      navigate('/');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConditionChange = (e: any) => {
    setListing({
        ...listing,
        condition: e.target.value
    });
  };  

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Listing
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={listing.title}
            onChange={handleInputChange}
            margin="normal"
            required
          />

        <FormControl fullWidth margin="normal" required>
            <InputLabel>Condition</InputLabel>
            <Select
              value={listing.condition}
              onChange={handleConditionChange}
              label="Condition"
            >
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Like New">Like New</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Fair">Fair</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
            </Select>
        </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={listing.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={listing.price}
            onChange={handleInputChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={listing.category}
              onChange={handleCategoryChange}
              label="Category"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 250, //This is the height of categories shown, if there are more categories it can be accessed by scrolling
                  },
                },
              }}
            >
              <MenuItem value="" style={{ color: 'grey' }}>Choose a Category</MenuItem> {/*If user wants to deselect*/}
              <MenuItem value="Books">Books</MenuItem>
              <MenuItem value="Clothes">Clothes</MenuItem>
              <MenuItem value="Laptops">Laptops</MenuItem>
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Sports Equipment">Sports Equipment</MenuItem>
              <MenuItem value="Bikes">Bikes</MenuItem>
              <MenuItem value="Collectables">Collectables</MenuItem>
              <MenuItem value="Miscellaneous">Miscellaneous</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Location</InputLabel>
            <Select
              value={listing.location}
              onChange={handleLocationChange}
              label="Location"
            >
              <MenuItem value="St. George">St. George</MenuItem>
              <MenuItem value="Mississauga">Mississauga</MenuItem>
              <MenuItem value="Scarborough">Scarborough</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload Images
              </Button>
            </label>
            
            {imagePreviews.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {listing.images.length} image(s) selected
                </Typography>
                <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
                  {imagePreviews.map((preview, index) => (
                    <ImageListItem key={preview} sx={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        loading="lazy"
                        style={{ height: '164px', objectFit: 'cover' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateListing; 