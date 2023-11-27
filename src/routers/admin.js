const express = require('express');
const router=express.Router()
const {bestClients, bestProfession} = require('../controllers/AdminController')

 

router.get('/best-profession', bestProfession );

router.get('/best-clients', bestClients );
 

module.exports = router;