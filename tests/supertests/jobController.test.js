const request = require('supertest');
const app = require('../../src/app'); // Import your Express app

const { getUnpaidJobs, payForJob } = require('../../src/services/jobService');
const { fetchUnpaidJobs, handlePayment } = require('../../src/controllers/JobController');

jest.mock('../../src/services/jobService');

describe('Job Controller Endpoints', () => {
  it('should fetch unpaid jobs for a profile', async () => {
    const profileId = 1;
    const mockUnpaidJobs = [{ jobId: 1 }];

    getUnpaidJobs.mockResolvedValue(mockUnpaidJobs);

    const response = await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', profileId.toString())
      .expect(200);

    expect(response.body).toEqual(mockUnpaidJobs);
  });


  it('should handle errors while fetching unpaid jobs', async () => {
    getUnpaidJobs.mockRejectedValue(new Error('Failed to fetch unpaid jobs'));

    const response = await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '1')
      .expect(500);

    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  
  it('should handle payment for a job', async () => {
    const profileId = 1;
    const jobId = 1;
    const mockPaymentMessage = 'Payment successful';

    payForJob.mockResolvedValue(mockPaymentMessage);

    const response = await request(app)
      .post(`/jobs/${jobId}/pay/`)
      .set('profile_id', profileId.toString())
      .expect(200);

    expect(response.body).toEqual({ message: mockPaymentMessage });
  });

  
  it('should handle invalid job ID during payment', async () => {
    const profileId = 1;
    const jobId = null;

    const response = await request(app)
      .post(`/jobs/${jobId}/pay/`)
      .set('profile_id', profileId.toString())
      .expect(400);

    expect(response.body).toEqual({ error: 'Job id is missing.' });
  });

  it('should handle errors during payment processing', async () => {
    const profileId = 1;
    const jobId = 1;

    payForJob.mockRejectedValue(new Error('Failed to process payment'));

    const response = await request(app)
      .post(`/jobs/${jobId}/pay/`)
      .set('profile_id', profileId.toString())
      .expect(500);

    expect(response.body).toEqual({ error: 'Failed to process payment' });
  });

  // Add more test cases for various scenarios as needed
});