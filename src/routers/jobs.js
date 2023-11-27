const express = require('express');
const router=express.Router()
const {getUnpaidJobs} = require('../controllers/JobController')



/**
 * @return unpaid jobs for a user with active clients only
 * 1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user 
 * (**_either_** a client or contractor), for **_active contracts only_**.
 */
router.get('/unpaid', getUnpaidJobs);

router.get('/', (req,res)=>
{
    res.status(200).json('hello');
}
);


module.exports = router ;