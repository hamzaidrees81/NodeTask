const express = require('express');
const router = express.Router()
const {
	getContractsByProfile,
	getContractById
} = require('../controllers/contractController')

router.get('/', getContractsByProfile);
router.get('/:id', getContractById)

module.exports = router;