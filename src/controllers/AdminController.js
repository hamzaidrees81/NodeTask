
const {Sequelize} = require('sequelize');
const {sequelize, Job, Contract, Profile} = require('../models/model');
const { getUnpaidJobs } = require('./JobController');


async function bestClients(req,res)
{
  
    //endpoint: localhost:3001/admin/best-clients?start=2020-08-01&end=2020-08-14&limit=22

    const result = await Contract.findAll({
        attributes: [ 'ClientId' , [sequelize.fn('SUM', sequelize.col('price')), 'totalJobCost']],
        include:[
            {
                model: Job,
                attributes: [],
            }
            ,
            {
                model: Profile , as: 'Client'
            }
        ]
        ,
        group: ['ClientId'],
        order: [['totalJobCost', 'DESC']],
       // limit : 1
    })

    

    res.status(200).json(result)
}


/**
 * retrieve max paying clients within a timespan
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function bestClients1 (req,res)
{
    console.debug('Calculating best clients...');

    const { Job, Contract, Profile } = req.app.get('models');

    const {start, end, limit} = req.query;

    //check if start or end is provided
    if (!start || !end) {
        console.error('Please provide both start and end dates.');
        return res.status(400).json({ error: 'Please provide both start and end dates.' });
      }
      
    const startDate = new Date(start);
    const endDate = new Date(end);
    //job paid date contains time as well so we need to go till end of the day
    endDate.setHours(23, 59, 59, 999);
    
    const results = await Profile.findAll({
        attributes: [ 'firstName' , 'lastName' , 'id',  [sequelize.fn('SUM', sequelize.col('client.jobs.price')), 'totalPaid'] ],
        include:
        [
            {
                attributes: [ ],
                model: Contract, as : 'Client', 
    
                //get jobs of client
                include: [{
                    model: Job,
                    attributes: [    
                  //      [sequelize.fn('SUM', sequelize.col('client.jobs.price')), 'totalPaid'],
                  //      [sequelize.fn('count', sequelize.col('client.jobs.price')), 'totalJobs'] 
                ],
                    where: {paid: true,
                      paymentDate : { [Sequelize.Op.between]: [startDate, endDate]}
                    }
                }]
            }
            
        ],
        where: { type : 'client' },
        group: [id],
        order: [[sequelize.literal('`totalPaid`'), 'DESC']],
        having: sequelize.where(sequelize.fn('SUM', sequelize.col('client.jobs.price')), {
            [Sequelize.Op.not]: null
        },
        ), 

        limit: 1
    })
      
     
    if (results.length === 0) {
        console.error('No data found for the given criteria.');
        return res.status(200).json({ error: 'No data found' });
    }
 
    const resultsWithLimit = await results.slice(0, limit).map(row => {
    const highestPaidFname = row.dataValues.firstName;
    const highestPaidLname = row.dataValues.lastName;
    const highestPaidAmount = row.dataValues.totalPaid;
    
    return {
        highestPaidFname,
        highestPaidLname,
        highestPaidAmount 
    };
});

    console.debug('Results are '+resultsWithLimit);

     res.status(200).json(resultsWithLimit);
}

/**
 * this function returns bestProfession based on a certain date range
 * @param {} req 
 * @param {*} res 
 * @returns 
 */
async function  bestProfession (req, res)  {
    // Adjusting the start and end dates to include the entire day
    const { start, end } = req.query;
    const { Job, Contract, Profile } = req.app.get('models');

    if (!start || !end) {
        console.error('Please provide both start and end dates.');
        return res.status(400).json({ error: 'Please provide both start and end dates.' });
      }

    const startDate = new Date(start);
    const endDate = new Date(end);
    //to cover end of day because we are storing time as well
    endDate.setHours(23, 59, 59, 999);

    console.debug('Extracting best profession.');

  try {
    const result = await Profile.findAll({
        
        attributes: [
            'profession',
           [sequelize.fn('SUM', sequelize.col('contractor.jobs.price')), 'totalEarned']
   
          ],
        include: [ 
        { model: Contract, as : 'Contractor',
            attributes: [  ],
            include : [{ model: Job ,
            attributes: [],
            where: { paid: true , paymentDate : { [Sequelize.Op.between]: [startDate, endDate]} }
        }]
        },
        ],
        where : {type: "contractor"},
        group: ['profession'],
            order: [[sequelize.literal('`totalEarned`'), 'DESC']],
            having: sequelize.where(sequelize.fn('SUM', sequelize.col('contractor.jobs.price')), {
                [Sequelize.Op.not]: null
            })
        });

       
        if (result.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        const topProfession = result[0].dataValues.profession;
        //const totalEarnings = result[0].dataValues.totalEarned;

        res.json({
            bestProfession: topProfession,
            //totalEarnings: totalEarnings
        });

   
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {bestProfession, bestClients}