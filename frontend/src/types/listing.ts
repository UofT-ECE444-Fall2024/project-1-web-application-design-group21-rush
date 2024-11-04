// This file defines the TypeScript interface for a Listing object.
// It ensures that any object representing a listing will have these properties.

export interface Listing {
  id: string; // Unique identifier for the listing
  title: string; // Title of the listing
  description: string; // Description of the listing
  price: number; // Price of the item in the listing
  imageUrl?: string; // URL of the image for the listing
  location: string; // Location where the item is available
  condition: string; // Condition of the item
  datePosted: string; // Date when the listing was posted
  sellerId: string; // ID of the seller
  sellerName: string; // Name of the seller
  // Add other fields as needed
}
