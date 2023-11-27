const {Sequelize} = require('sequelize');
const {sequelize, Job, Contract, Profile} = require('../models')

/**
 * get all unpaid jobs belonging to a user 
 * @param {*} req 
 * @param {*} res 
 */
async function  getUnpaidJobs(req, res) {    
    // Profile id of requester to show relevant jobs only
    const profileId = req.get('profile_id');

    try {
        const unpaidJobs = await Job.findAll({
            include: [{
                model: Contract,
                where: {
                    [Sequelize.Op.or]: [
                        { contractorId: profileId },
                        { clientId: profileId }
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

    try {
        await sequelize.transaction(async (t) => {
          const job = await Job.findOne({
            where: { id: jobId },
            include: {
              model: Contract,
              include: [
                {
                  model: Profile,
                  as: 'Client',
                  where: { id: profileId }
                }
              ]
            }
          });
      
          if (!job) {
            console.error('Job not found with id: ' + jobId);
            return res.status(404).json({ error: 'Job not found' });
          }
      
          if (job.paid) {
            return res.status(400).json({ error: 'Job is already paid' });
          }
      
          const price = job.price;
          const clientBalance = job.Contract.Client.balance;
      
          if (price > clientBalance) {
            return res.status(400).json({
              error: `Insufficient balance: User does not have enough balance to pay. Required balance: ${price}`
            });
          }
      
          // Deduct from client and add to contractor balances
          await Profile.decrement('balance', { by: price, where: { id: job.Contract.ClientId }, transaction: t });
          await Profile.increment('balance', { by: price, where: { id: job.Contract.ContractorId }, transaction: t });
      
          // Mark job as paid and update paymentDate
          await Job.update(
            { paid: true, paymentDate: Sequelize.literal('CURRENT_TIMESTAMP') },
            { where: { id: jobId }, transaction: t }
          );
      
          res.json({ message: 'Payment successful' });
        });
      } catch (error) {
        console.error('Transaction error:', error);
        return res.status(500).json({ error: 'Transaction failed. Please try again later.' });
      }
}

module.exports = {getUnpaidJobs, payJob};