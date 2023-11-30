const { Sequelize } = require('sequelize');
const { sequelize, Job, Contract, Profile } = require('../models');

/**
 * get all unpaid jobs
 * @param {*} profileId 
 * @returns 
 */
async function getUnpaidJobs(profileId) {
  try {
    const unpaidJobs = await Job.findAll({
      include: [
        {
          model: Contract,
          where: {
            [Sequelize.Op.or]: [{ contractorId: profileId }, { clientId: profileId }],
            status: 'in_progress',
          },
          attributes: [],
        },
      ],
      where: {
        paid: { [Sequelize.Op.not]: true },
      },
    });

    return unpaidJobs;
  } catch (error) {
    throw new Error('Error fetching unpaid jobs');
  }
}

/**
 * pay for a job - move money from client to contractor
 * @param {*} profileId 
 * @param {*} jobId 
 * @returns 
 */
async function payForJob(profileId, jobId) {
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
              where: { id: profileId },
            },
          ],
        },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.paid) {
        throw new Error('Job is already paid');
      }

      const price = job.price;
      const clientBalance = job.Contract.Client.balance;

      if (price > clientBalance) {
        throw new Error(`Insufficient balance: User does not have enough balance to pay.`);
      }

      await Profile.decrement('balance', {
        by: price,
        where: { id: job.Contract.ClientId },
        transaction: t,
      });
      await Profile.increment('balance', {
        by: price,
        where: { id: job.Contract.ContractorId },
        transaction: t,
      });

      await Job.update(
        { paid: true, paymentDate: Sequelize.literal('CURRENT_TIMESTAMP') },
        { where: { id: jobId }, transaction: t }
      );
    });

    return 'Payment successful';
  } catch (error) {
    throw new Error('Transaction failed. Reason: '+error);
  }
}

module.exports = { getUnpaidJobs, payForJob };
