import React from 'react';
import { 
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../../types/listing';
import { listingsApi } from '../../services/api';

interface ListingCardProps {
  listing: Listing;
  context?: 'home' | 'recommended' | 'wishlist';
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, context = 'home' }) => {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  const navigate = useNavigate();

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
    
    if (context === 'home') {
      setShowLoginDialog(true);
      return;
    }

    try {
      if (isWishlisted) {
        await listingsApi.removeFromWishlist(listing.id);
      } else {
        await listingsApi.addToWishlist(listing.id);
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // TODO: Add error toast notification
    }
  };

  const handleCardClick = () => {
    if (context === 'home') {
      setShowLoginDialog(true);
    } else {
      navigate(`/productInfo/${listing.id}`);
    }
  };

  const handleLoginClick = () => {
    setShowLoginDialog(false);
    navigate('/login');
  };

  const handleSignupClick = () => {
    setShowLoginDialog(false);
    navigate('/signup');
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 6,
          },
        }}
        onClick={handleCardClick}
      >
        {/* Image */}
        <CardMedia
          component="img"
          height="200"
          image={listing.imageUrl || '/placeholder-image.jpg'}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />

        {/* Wishlist Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
          onClick={handleWishlistClick}
        >
          {isWishlisted ? (
            <FaHeart color="#ff4444" size={20} />
          ) : (
            <FaRegHeart color="#666666" size={20} />
          )}
        </IconButton>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {listing.title}
          </Typography>
          
          <Typography variant="h6" color="primary" gutterBottom>
            ${listing.price.toFixed(2)}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
            {listing.description}
          </Typography>
        </CardContent>

        {/* Additional Info */}
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {listing.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {listing.condition}
          </Typography>
        </CardActions>
      </Card>

      {/* Login/Signup Dialog */}
      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>Sign in Required</DialogTitle>
        <DialogContent>
          <Typography>
            Please sign in or create an account to view listing details.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleLoginClick} variant="contained" color="primary">
            Sign In
          </Button>
          <Button onClick={handleSignupClick} variant="outlined" color="primary">
            Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListingCard;
