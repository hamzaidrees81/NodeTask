const express = require('express');
const router=express.Router()
const {getBestClients, getBestProfession} = require('../controllers/AdminController')

 

router.get('/best-profession', getBestProfession );
router.get('/best-clients', getBestClients );
 

module.exports = router;