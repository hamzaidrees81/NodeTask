// test/adminService.test.js
const request = require('supertest');
const app = require('../../src/app'); // Import your Express app

const { getBestProfession, getBestClients } = require('../../src/services/adminService');

jest.mock('../../src/services/adminService');

describe('Admin Service Endpoints', () => {
  it('should get the best profession', async () => {
    const start = '2023-01-01';
    const end = '2023-12-31';

    const mockProfessionResult = {
      profession: 'Engineer',
      totalProfit: 10000
    };

    getBestProfession.mockResolvedValue(mockProfessionResult);

    const response = await request(app)
      .get(`/admin/best-profession?start=${start}&end=${end}`)
      .set('profile_id', 1)
      .expect(200);

    expect(response.body).toEqual(mockProfessionResult);
  });

  it('should handle missing start or end dates for profession', async () => {
    const start = '2023-01-01';

    const response = await request(app)
      .get(`/admin/best-profession?start=${start}`)
      .set('profile_id', 1)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Please provide both start and end dates.'
    });
  });

  it('should get the best clients', async () => {
    const start = '2023-01-01';
    const end = '2023-12-31';
    const limit = 10;

    const mockClientsResult = [
      { clientId: 1, totalSpent: 500 },
      { clientId: 2, totalSpent: 800 }
    ];

    getBestClients.mockResolvedValue(mockClientsResult);

    const response = await request(app)
      .get(`/admin/best-clients?start=${start}&end=${end}&limit=${limit}`)
      .set('profile_id', 1)
      .expect(200);

    expect(response.body).toEqual(mockClientsResult);
  });

  it('should handle missing start or end dates for clients', async () => {
    const start = '2023-01-01';

    const response = await request(app)
      .get(`/admin/best-clients?start=${start}`)
      .set('profile_id', 1)
      .expect(400);

    expect(response.body).toEqual({
      error: 'Please provide both start and end dates.'
    });
  });

  // Add more test cases for various scenarios as needed
});
