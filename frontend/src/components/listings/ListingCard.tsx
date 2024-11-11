import React, { useState, useEffect } from "react";
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
  Button,
} from "@mui/material";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Listing } from "../../types/listing";
import { listingsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface ListingCardProps {
  listing: Listing;
  context?: "home" | "recommended" | "wishlist";
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  context = "home",
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, getToken } = useAuth();

  // Check if item is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = getToken();
        if (!token) return;
        
        const wishlistItems = await listingsApi.getWishlistItems(token);
        setIsWishlisted(wishlistItems.some(item => item.id === listing.id));
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, listing.id, getToken]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    const token = getToken();
    if (!token) {
      setShowLoginDialog(true);
      return;
    }

    try {
      setIsUpdating(true);
      if (isWishlisted) {
        await listingsApi.removeFromWishlist(listing.id, token);
      } else {
        await listingsApi.addToWishlist(listing.id, token);
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/productInfo/${listing.id}`);
  };

  const handleLoginClick = () => {
    setShowLoginDialog(false);
    navigate("/login");
  };

  const handleSignupClick = () => {
    setShowLoginDialog(false);
    navigate("/signup");
  };

  const formatPrice = (price: any): string => {
    // Handle different price formats (string, number, undefined)
    const numPrice =
      typeof price === "string" ? parseFloat(price) : Number(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  const getImageUrl = (listing: Listing): string => {
    // If there's a direct imageUrl, use it
    if (listing.imageUrl) return listing.imageUrl;

    // If there are images in the array, use the first one
    if (listing.images && listing.images.length > 0) return listing.images[0];

    // Fallback to placeholder
    return "/placeholder-image.jpg";
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          cursor: "pointer",
          "&:hover": {
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
        onClick={handleCardClick}
      >
        {/* Image */}
        <CardMedia
          component="img"
          height="200"
          image={getImageUrl(listing)}
          alt={listing.title}
          sx={{ 
            objectFit: 'cover',
            backgroundColor: 'grey.100' // Background color while image loads
          }}
        />

        {/* Wishlist Button */}
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
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
            ${formatPrice(listing.price)}
          </Typography>

          <Typography variant="body2" color="text.secondary" noWrap>
            {listing.description}
          </Typography>
        </CardContent>

        {/* Additional Info */}
        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
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
        <DialogActions
          sx={{ padding: 2, display: "flex", justifyContent: "space-between" }}
        >
          <Button
            onClick={handleLoginClick}
            variant="contained"
            color="primary"
          >
            Sign In
          </Button>
          <Button
            onClick={handleSignupClick}
            variant="outlined"
            color="primary"
          >
            Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListingCard;
