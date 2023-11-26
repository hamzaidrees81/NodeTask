const express = require('express');
const bodyParser = require('body-parser');
const {sequelize, Contract} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const Sequelize = require('sequelize');
const app = express();

const jobController = require('./controllers/JobController')

app.use(bodyParser.json());
app.use(getProfile)
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @return unpaid jobs for a user with active clients only
 * 1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user 
 * (**_either_** a client or contractor), for **_active contracts only_**.
 */
app.get('/jobs/unpaid',  async (req, res) => {
    // Profile id of requester
    const profileId = req.get('profile_id');
    const { Job, Contract, Profile } = req.app.get('models');

    try {
        const unpaidJobs = await Job.findAll({
            include: [{
                model: Contract,
                include: [
                    { model: Profile, as: 'Contractor' },
                    { model: Profile, as: 'Client' }
                ],
                where: {
                    [Sequelize.Op.or]: [
                        { ContractorId: profileId },
                        { ClientId: profileId }
                    ],
                    status: 'in_progress' // Assuming there's a field 'status' in Contract model representing contract status
                },
                model: Contract
                
            }],
            where: { [Sequelize.Op.or]: [{ paid: false }, { paid: null }] } // DOES NOT WORK
        });

        res.json(unpaidJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * @return unpaid jobs for a user with active clients only
 * 1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user 
 * (**_either_** a client or contractor), for **_active contracts only_**.
 */
app.get('/jobs/unpaid1', getProfile, async (req, res) => {
    // Profile id of requester
    const profileId = req.get('profile_id');
    const { Job, Contract, Profile } = req.app.get('models');

    try {
        const unpaidJobs = await Job.findAll({
            include: [{
                model: Contract,
                where: {
                    
                    status: 'in_progress' // Assuming there's a field 'status' in Contract model representing contract status
                },
                model: Contract,
                include: [
                    { model: Profile, as: 'Contractor' },
                    { model: Profile, as: 'Client' }
                ]
            }],
            where: { [Sequelize.Op.or]: [{ paid: false }, { paid: null }] }, // Filter for unpaid or null paid status
                 
       });

        res.json(unpaidJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const profileId = req.get('profile_id');
    const jobId = req.params.job_id;
    const { Job, Contract, Profile } = req.app.get('models');

    try {
//TODO: SHOULD A CLIENT ONLY PAY FOR ITSELF?
        console.log('Searching for job');

        const job = await Job.findOne({
            where: { id: jobId },
            include: {
                model: Contract,
                include: [
                  { model: Profile,
                    as: 'Client',
                 where: {
                    id: profileId 
                      }
                 }
                ]
            }
        });

        console.log('job found.');

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        console.log('Client id for contract is ' + job.Contract.ClientId+" - passed client id is : "+profileId);        

        // Check if the requester is the client associated with the job //DO IT IN QUERY

        // Check if the job is already paid
        if (job.paid) {
            return res.status(400).json({ error: 'Job is already paid' });
        }

        // Check if the client's balance is enough to pay for the job
        if (job.price > job.Contract.Client.balance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        console.log('performing transaction');

        // Update balances - deduct from client and add to contractor
        await sequelize.transaction(async (t) => {
            await Profile.decrement('balance', { by: job.price, where: { id: job.Contract.ClientId }, transaction: t });
            await Profile.increment('balance', { by: job.price, where: { id: job.Contract.ContractorId }, transaction: t });
            await Job.update({ paid: true, paymentDate: Sequelize.literal('CURRENT_TIMESTAMP') }, { where: { id: jobId }, transaction: t });
        });

        res.json({ message: 'Payment successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/admin/best-profession', getProfile,  async (req, res) => {
    // Adjusting the start and end dates to include the entire day
    const { start, end } = req.query;
    const { Job, Contract, Profile } = req.app.get('models');

    const startDate = new Date(start);
    const endDate = new Date(end);
  
   
  try {
    const result = await Profile.findAll({
        attributes: [
            'profession',
//           [sequelize.fn('SUM', sequelize.col('contractor.jobs.price')), 'totalEarned']
          ],
        include: [ 
        { model: Contract, as : 'Contractor',
            attributes: [ 'contractorId' ],
            include : [{ model: Job ,
            attributes: [
                'price',
                [sequelize.fn('SUM', sequelize.col('contractor.jobs.price')), 'totalEarned']
            ],
            where: { paid: true }
        }]
        },
        ],
        where : {type: "contractor"},
        group: ['profession'],
            //order: [[sequelize.col('Contractor.Jobs.totalEarned'), 'DESC']]
            order: [[sequelize.literal('`Contractor.Jobs.totalEarned`'), 'DESC']]
        });



    console.log('Result: ' + result);
    //console.log(result);

        if (result.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        res.json(result);
       /* res.json({
            bestProfession: result[0].dataValues.profession,
            totalEarnings: result[0].dataValues.totalEarnings
        });
        */
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

 


app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const userId = req.params.userId;
    const depositAmount = parseFloat(req.body.amount); // Assuming the amount is sent in the request body
    const { Job, Profile } = req.app.get('models');

    try {
        const client = await Profile.findOne({
            where: { id: userId },
            include: [
                {
                    model: Contract,
                    as: 'Client',
                    include: {
                        model: Job,
                        where: {
                            [Sequelize.Op.or]: [
                                { paid: false },
                                { paid: null } // Consider only unpaid jobs
                            ]
                        },
                        attributes: [
                            [Sequelize.fn('SUM', Sequelize.col('price')), 'totalJobsToPay']
                        ]
                    }
                }
            ]
        });
    
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
    
        const totalJobsToPay = client.Client.reduce((sum, contract) => {
            return sum + (contract.Jobs.length > 0 ? parseFloat(contract.Jobs[0].dataValues.totalJobsToPay) : 0);
        }, 0) || 0;
    
        const maxDeposit = totalJobsToPay * 0.25; // Calculate 25% of total jobs to pay
    
        if (depositAmount > maxDeposit) {
            return res.status(400).json({ error: 'Deposit exceeds 25% of total jobs to pay' });
        }
    
        // Update the balance
        const updatedBalance = client.balance + depositAmount;
        await Profile.update({ balance: updatedBalance }, { where: { id: userId } });
    
        res.json({ message: 'Deposit successful', newBalance: updatedBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
});



/**
 * @returns all contract
 */
app.get('/contracts',getProfile ,async (req, res) =>{
    //profile id of requester
    profileId = req.get('profile_id')
    const {Contract} = req.app.get('models')
    
    //return a contract if the profile matches a client or contractor
    const contract = await Contract.findAll({where: {
            [Sequelize.Op.or]: [
            { contractorId: profileId },
            { clientId: profileId } 
        ]
        ,
        [Sequelize.Op.not ]: [
            {
                status: 'terminated'
            }
        ]        
    }});

    if(!contract) return res.status(404).end()
    res.json(contract)
})


/**
 * @returns contract by id
 */
app.get('/contracts/:id',getProfile ,async (req, res) =>{
    //profile id of requester
    profileId = req.get('profile_id')
    const {Contract} = req.app.get('models')
    const {id} = req.params
    
    //return a contract if the profile matches a client or contractor
    const contract = await Contract.findOne({where: {id , 
            [Sequelize.Op.or]: [
            { contractorId: profileId },
            { clientId: profileId } 
        ]
    }});

    if(!contract) return res.status(404).end()
    res.json(contract)
})
module.exports = app;
