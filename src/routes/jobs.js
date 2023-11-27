const express = require('express');
const router = express.Router()
const {
	getUnpaidJobs,
	payJob
} = require('../controllers/JobController')



/**
 * @return unpaid jobs for a user with active clients only
 * 1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user 
 * (**_either_** a client or contractor), for **_active contracts only_**.
 */
router.get('/unpaid', getUnpaidJobs);
router.post('/:job_id/pay', payJob);



module.exports = router;