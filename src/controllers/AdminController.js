
const {Sequelize} = require('sequelize');
const {sequelize, Job, Contract, Profile} = require('../models/model');
const { getUnpaidJobs } = require('./JobController');


async function bestProfession(req,res)
{
 
    const {start, end} = req.query;

    //check if start or end is provided
    if (!start || !end) {
        console.error('Please provide both start and end dates.');
        return res.status(400).json({ error: 'Please provide both start and end dates.' });
      }
      
    const startDate = new Date(start);
    const endDate = new Date(end);
    //job paid date contains time as well so we need to go till end of the day
    endDate.setHours(23, 59, 59, 999);

    
    const result = await Job.findOne({
        attributes: [  [sequelize.fn('SUM', sequelize.col('price')), 'totalEarning']],
        include:[
            {
                model: Contract,
                include: [
                {
                    model: Profile , as: 'Client',
                }
            ]
            }
        ],
        where: { paid: true,  paymentDate : { [Sequelize.Op.between]: [startDate, endDate]} },
        group: ['profession'],
        order: [['totalEarning', 'DESC']],
        //raw: true
    })

    if (result === null) {
        console.error('No data found for the given criteria.');
        return res.status(200).json({ error: 'No data found for the given criteria.' });
    }

    res.status(200).json(result.Contract.Client.profession)
}


/**
 * retrieve list of best clients in a timeperiod with a limit
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function bestClients(req,res)
{
    const {start, end} = req.query;
    var {limit} = req.query;
    
    //check if start or end is provided
    if (!start || !end) {
        console.error('Please provide both start and end dates.');
        return res.status(400).json({ error: 'Please provide both start and end dates.' });
      }

    //if limit is not provided, set default limit to 2
    if(limit == null)
        limit = 2;
      
    const startDate = new Date(start);
    const endDate = new Date(end);
    //job paid date contains time as well so we need to go till end of the day
    endDate.setHours(23, 59, 59, 999);

    const result = await Job.findAll({
        attributes: [  [sequelize.fn('SUM', sequelize.col('price')), 'totalJobCost']],
        include:[
            {
                model: Contract,
                attributes: [],
                include: [
                {
                    model: Profile , as: 'Client',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
            }
        ],
        where: { paid: true,  paymentDate : { [Sequelize.Op.between]: [startDate, endDate]} },
        group: ['ClientId'],
        order: [['totalJobCost', 'DESC']],
        limit : limit,
        raw: true
    })

    res.status(200).json(result)
}

module.exports = {bestProfession, bestClients}