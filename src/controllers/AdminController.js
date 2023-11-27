
const {Sequelize} = require('sequelize');
const {sequelize} = require('../models/model')


async function bestClients (req,res)
{
    const { Job, Contract, Profile } = req.app.get('models');

    const {start, end, limit} = req.query;

    //check if start or end is provided

    if (!start || !end) {
        return res.status(400).json({ error: 'Please provide both start and end dates.' });
      }
      
    const startDate = new Date(start);
    const endDate = new Date(end);
    //to cover end of day because we are storing time as well
    endDate.setHours(23, 59, 59, 999);

   
    const results = await Profile.findAll({
        attributes: [ 'firstName' , 'lastName' ,  [sequelize.fn('SUM', sequelize.col('client.jobs.price')), 'totalPaid'] ],
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
                  //       paymentDate : { [Sequelize.Op.between]: [startDate, endDate]}
                    }
                }]
            }
            
        ],
        where: { type : 'client' },
        group: ['firstName' , 'lastName' ],
        order: [[sequelize.literal('`totalPaid`'), 'DESC']],
        having: sequelize.where(sequelize.fn('SUM', sequelize.col('client.jobs.price')), {
            [Sequelize.Op.not]: null
        },
        ), 
    })
      
     
    if (results.length === 0) {
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

     res.status(200).json(resultsWithLimit);
}

async function  bestProfession (req, res)  {
    // Adjusting the start and end dates to include the entire day
    const { start, end } = req.query;
    const { Job, Contract, Profile } = req.app.get('models');

    if (!start || !end) {
        return res.status(400).json({ error: 'Please provide both start and end dates.' });
      }

    const startDate = new Date(start);
    const endDate = new Date(end);
    //to cover end of day because we are storing time as well
    endDate.setHours(23, 59, 59, 999);

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
            //order: [[sequelize.col('Contractor.Jobs.totalEarned'), 'DESC']]
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