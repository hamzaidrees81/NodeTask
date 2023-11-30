const express = require('express');
const router = express.Router()
const {
	findBestProfession,
	findBestClients
} = require('../controllers/AdminController')

router.get('/best-profession', findBestProfession);
router.get('/best-clients', findBestClients);

module.exports = router;