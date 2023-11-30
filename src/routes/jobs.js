const express = require('express');
const router = express.Router()
const {
	fetchUnpaidJobs,
	handlePayment
} = require('../controllers/JobController')

router.get('/unpaid', fetchUnpaidJobs);
router.post('/:job_id/pay', handlePayment);

module.exports = router;