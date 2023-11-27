const express = require('express');
const router=express.Router()
const {getAllContracts, getContractById} = require('../controllers/ContractController')

 router.get('/', getAllContracts);
 
router.get('/:id',getContractById)

module.exports = router ;