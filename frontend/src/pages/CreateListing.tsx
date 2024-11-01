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
  InputAdornment
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
      setListing({
        ...listing,
        images: [...listing.images, ...Array.from(e.target.files)]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create listing
    console.log('Submitting listing:', listing);
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
            {listing.images.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {listing.images.length} image(s) selected
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            Create Listing
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateListing; 