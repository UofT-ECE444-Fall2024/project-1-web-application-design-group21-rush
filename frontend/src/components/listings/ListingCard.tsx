import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Listing } from '../../types/listing';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <Card sx={{ maxWidth: 345, m: 1 }}>
      <CardMedia
        component="img"
        height="140"
        image={listing.images[0]}
        alt={listing.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {listing.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {listing.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">${listing.price}</Typography>
          <Typography variant="body2" color="text.secondary">
            {listing.location}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
