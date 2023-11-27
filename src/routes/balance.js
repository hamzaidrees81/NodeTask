const express = require('express');
const router=express.Router()
const {depositBalance} = require('../controllers/BalanceController')

 

router.post('/deposit/:userId', depositBalance );

module.exports = router;