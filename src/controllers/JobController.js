const { getUnpaidJobs, payForJob } = require('../services/jobService');

async function fetchUnpaidJobs(req, res) {
  try {
    const userId = req.get('profile_id');

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'User id is missing.' });
    }
    const unpaidJobs = await getUnpaidJobs(userId);

    res.json(unpaidJobs);
  } catch (error) {
    console.error('Error fetching unpaid jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePayment(req, res) {
  try {
    const userId = req.get('profile_id');
    const jobId  = req.params.job_id;
  
      if (userId ===null || isNaN(userId)) {
        return res.status(400).json({ error: 'User id is missing.' });
      }

      if (jobId ===null || isNaN(jobId)) {
        return res.status(400).json({ error: 'Please give correct Job id.' });
      }

    const message = await payForJob(userId, jobId);

    res.json({ message });
  } catch (error) {
    console.error('Error processing payments:', error);
    res.status(500).json({ error: error.message  });
  }
}

module.exports = { fetchUnpaidJobs, handlePayment };
