const express = require('express');
const router = express.Router()
const {
	getUnpaidJobs,
	payJob
} = require('../controllers/JobController')

router.get('/unpaid', getUnpaidJobs);
router.post('/:job_id/pay', payJob);

module.exports = router;