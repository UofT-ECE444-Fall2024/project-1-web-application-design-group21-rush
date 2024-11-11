import { listingsApi } from '../../services/api';
import axios from 'axios';

jest.mock('axios');

describe('Listings Management - Integration Tests', () => {
  const mockListings = [
    {
      id: '1',
      title: 'Test Item',
      description: 'A test item description',
      price: 100,
    },
  ];

  const LISTINGS_SERVICE_URL = 'http://localhost:5001';
  const USER_SERVICE_URL = 'http://localhost:5005';

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test

    // Mock localStorage.getItem to return 'testToken' for 'token'
    global.localStorage = {
      getItem: jest.fn().mockReturnValue('testToken'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    } as any;
  });

  it('should retrieve all listings successfully', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { listings: mockListings } });

    const listings = await listingsApi.getListings();
    expect(listings).toEqual(mockListings);

    expect(axios.get).toHaveBeenCalledWith(
      `${LISTINGS_SERVICE_URL}/api/listings/all`
    );
  });

  it('should create a new listing successfully', async () => {
    const newListing = { title: 'New Item', description: 'New item description', price: 200 };
    const formData = new FormData();
    formData.append('title', newListing.title);
    formData.append('description', newListing.description);
    formData.append('price', newListing.price.toString());

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'Listing created successfully' } });

    const response = await listingsApi.createListing(formData); // No need to pass token
    expect(response.message).toBe('Listing created successfully');

    expect(axios.post).toHaveBeenCalledWith(
      `${LISTINGS_SERVICE_URL}/api/listings/create-listing`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer testToken`,
        },
      }
    );
  });

  it('should edit an existing listing successfully', async () => {
    const updatedListing = { title: 'Updated Item', price: 150 };
    const formData = new FormData();
    formData.append('title', updatedListing.title);
    formData.append('price', updatedListing.price.toString());

    (axios.put as jest.Mock).mockResolvedValueOnce({
      data: { message: 'Listing updated successfully' },
    });

    const response = await listingsApi.editListing('1', formData);
    expect(response.message).toBe('Listing updated successfully');

    expect(axios.put).toHaveBeenCalledWith(
      `${LISTINGS_SERVICE_URL}/api/listings/edit/1`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });

  it('should delete a listing successfully', async () => {
    (axios.delete as jest.Mock).mockResolvedValueOnce({
      data: { message: 'Listing deleted successfully' },
    });

    const response = await listingsApi.deleteListing('1');
    expect(response.data.message).toBe('Listing deleted successfully');

    expect(axios.delete).toHaveBeenCalledWith(
      `${LISTINGS_SERVICE_URL}/api/listings/delete/1`
    );
  });

  it('should retrieve a listing by ID successfully', async () => {
    const listingId = '1';
    const mockListing = {
      id: listingId,
      title: 'Test Item',
      description: 'Test description',
      price: 100,
    };

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { listing: mockListing } });

    const listing = await listingsApi.getListingById(listingId);
    expect(listing).toEqual(mockListing);

    expect(axios.get).toHaveBeenCalledWith(
      `${LISTINGS_SERVICE_URL}/api/listings/${listingId}`
    );
  });

  it('should add a listing to the wishlist successfully', async () => {
    const listingId = '1';
    const token = 'testToken';

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: { message: 'Listing added to wishlist' } });

    const response = await listingsApi.addToWishlist(listingId, token);
    expect(response.message).toBe('Listing added to wishlist');

    expect(axios.post).toHaveBeenCalledWith(
      `${USER_SERVICE_URL}/api/users/wishlist`,
      { listingId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  });

  it('should remove a listing from the wishlist successfully', async () => {
    const listingId = '1';
    const token = 'testToken';

    (axios.delete as jest.Mock).mockResolvedValueOnce({ data: { message: 'Listing removed from wishlist' } });

    const response = await listingsApi.removeFromWishlist(listingId, token);
    expect(response.message).toBe('Listing removed from wishlist');

    expect(axios.delete).toHaveBeenCalledWith(
      `${USER_SERVICE_URL}/api/users/wishlist/${listingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  });

  it('should retrieve wishlist items successfully', async () => {
    const token = 'testToken';

    // Mock the response for the wishlist API call
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        wishlist: ['1'], // Mock wishlist containing one listing ID
      },
    });

    // Mock the response for the getListingById call
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { listing: mockListings[0] },
    });

    const wishlistItems = await listingsApi.getWishlistItems(token);
    expect(wishlistItems).toEqual([mockListings[0]]);

    // Check that axios.get was called correctly for the wishlist
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      `${USER_SERVICE_URL}/api/users/wishlist/get`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Check that axios.get was called correctly for getListingById
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      `${LISTINGS_SERVICE_URL}/api/listings/1`
    );
  });
});
