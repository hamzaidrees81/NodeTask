const express = require('express');
const router=express.Router()
const {getContractsByProfileId, getContractById} = require('../controllers/ContractController')

router.get('/', getContractsByProfileId);
router.get('/:id',getContractById)

module.exports = router;