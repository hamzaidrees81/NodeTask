const express = require('express');
const router = express.Router();

const jobRoutes = require('./jobs');
const adminRoutes = require('./admin');
const contractRoutes = require('./contracts');
const balanceRoutes = require('./balance');

router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);
router.use('/contracts', contractRoutes);
router.use('/balances', balanceRoutes);

module.exports = router;
