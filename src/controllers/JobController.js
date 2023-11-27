const {Sequelize} = require('sequelize');
const {sequelize} = require('../models/model')
/**
 * get all unpaid jobs belonging to a user 
 * @param {*} req 
 * @param {*} res 
 */
async function  getUnpaidJobs(req, res) {
    
    // Profile id of requester to show relevant jobs only
    const profileId = req.get('profile_id');
    const { Job, Contract, Profile } = req.app.get('models');

    try {
        const unpaidJobs = await Job.findAll({
            include: [{
                model: Contract,
                where: {
                    [Sequelize.Op.or]: [
                        { ContractorId: profileId },
                        { ClientId: profileId }
                    ],
                    status: 'in_progress'
                },
                attributes: [] //attirbutes of contract are not required
            }],

            where: {
                paid: {[Sequelize.Op.not]: true}}
        });

        res.json(unpaidJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * pay for a job
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function  payJob (req, res) {
    const profileId = req.get('profile_id');
    const jobId = req.params.job_id;
    const { Job, Contract, Profile } = req.app.get('models');

    try {
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

        if (!job) {
            log.debug('Job not found.')
            return res.status(200).json({ error: 'Job not found' });
        }

        // Check if the job is already paid
        if (job.paid) {
            return res.status(400).json({ error: 'Job is already paid' });
        }

        // Check if the client's balance is enough to pay for the job
        if (job.price > job.Contract.Client.balance) {
            return res.status(400).json({ error: 'Insufficient balance: User does not have enough balance to pay. Required balance: '+job.Contract.price });
        }

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