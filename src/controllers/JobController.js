const {Sequelize} = require('sequelize');

async function  getUnpaidJobs(req, res) {
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
}


async function  payJob (req, res) {
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
}



module.exports = {getUnpaidJobs, payJob};