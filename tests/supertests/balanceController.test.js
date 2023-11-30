const request = require('supertest');
const app = require('../../src/app');

const { depositToClient } = require('../../src/services/balanceService');

jest.mock('../../src/services/balanceService');

describe('Balance Controller Endpoints', () => {
  it('should deposit balance for a client', async () => {
    const userId = 123;
    const depositAmount = 100;

    const mockResult = {
      success: true,
      message: 'Balance deposited successfully'
    };

    depositToClient.mockResolvedValue(mockResult);

    const response = await request(app)
      .post(`/balances/deposit/${userId}`)
      .send({ amount: depositAmount })
      .set('profile_id', 1)
      .expect(200);

    expect(response.body).toEqual(mockResult);
  });

  it('should handle invalid deposit amount', async () => {
    const userId = 123;
    const depositAmount = 'invalid';

    const response = await request(app)
      .post(`/balances/deposit/${userId}`)
      .send({ amount: depositAmount })
      .set('profile_id', 1)
      .expect(500);

    expect(response.body).toEqual({ error: 'Invalid amount passed' });
  });

  it('should handle missing user ID', async () => {
    const depositAmount = 100;
    const userId = null;
    
    const response = await request(app)
      .post(`/balances/deposit/${userId}`)
      .send({ amount: depositAmount })
      .set('profile_id', 1)
      .expect(500);

    expect(response.body).toEqual({ error: 'User id is missing.' });
  });

    //ADD More tests to confirm the structure received is standard
  });