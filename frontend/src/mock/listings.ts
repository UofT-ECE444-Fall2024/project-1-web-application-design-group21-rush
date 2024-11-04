export const mockListings = [
  {
    id: '1',
    title: 'Calculus Textbook - 8th Edition',
    description: 'Like new calculus textbook, perfect for first-year students. Includes practice problems and solutions.',
    price: 45.99,
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
    location: 'St. George',
    condition: 'Like New',
    datePosted: '2024-03-15',
    sellerId: 'user1',
    sellerName: 'John Doe'
  },
  {
    id: '2',
    title: 'Desk Lamp with USB Port',
    description: 'Modern LED desk lamp with adjustable brightness and built-in USB charging port.',
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800',
    location: 'Mississauga',
    condition: 'Good',
    datePosted: '2024-03-14',
    sellerId: 'user2',
    sellerName: 'Jane Smith'
  },
  {
    id: '3',
    title: 'Digital Camera',
    description: 'Professional digital camera in excellent condition. Perfect for photography enthusiasts and students taking media courses.',
    price: 399.99,
    imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800',
    location: 'Scarborough',
    condition: 'Good',
    datePosted: '2024-03-13',
    sellerId: 'user3',
    sellerName: 'Mike Johnson'
  },
  {
    id: '4',
    title: 'Ergonomic Office Chair',
    description: 'Comfortable office chair with lumbar support and adjustable height. Perfect for long study sessions.',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
    location: 'St. George',
    condition: 'Like New',
    datePosted: '2024-03-12',
    sellerId: 'user4',
    sellerName: 'Sarah Wilson'
  },
  {
    id: '5',
    title: 'MacBook Pro Laptop Stand',
    description: 'Aluminum laptop stand, helps with better posture and laptop cooling.',
    price: 25.00,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    location: 'Mississauga',
    condition: 'New',
    datePosted: '2024-03-11',
    sellerId: 'user5',
    sellerName: 'Alex Brown'
  }
];

export const mockWishlistItems = [
  mockListings[1],
  mockListings[3],
];

export const mockRecommendedItems = [
  mockListings[0],
  mockListings[2],
  mockListings[4],
]; 