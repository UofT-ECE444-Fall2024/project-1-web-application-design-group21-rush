// src/services/__tests__/listingsApi.test.ts
const { listingsApi } = require('../../services/api');
const axios = require('axios');

jest.mock('axios');

describe('Listings Management - Integration Tests', () => {
  const mockListings = [
    { id: '1', title: 'Test Item', description: 'A test item description', price: 100 },
  ];

  it('should retrieve all listings successfully', async () => {
    axios.get.mockResolvedValueOnce({ data: { listings: mockListings } });

    const listings = await listingsApi.getListings();
    expect(listings).toEqual(mockListings);

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:5001/api/listings/all`
    );
  });
});
