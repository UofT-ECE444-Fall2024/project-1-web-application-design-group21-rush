import React from 'react';
import { Card } from '@mui/material';
import { Listing } from '../../types/listing';

interface ListingCardProps {
  listing: Listing;
}

// TODO: Ryan - Implement listing card display
const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <Card>
      {/* TODO: Ryan - Add listing display implementation here */}
    </Card>
  );
};

export default ListingCard;
