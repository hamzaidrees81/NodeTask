const { Sequelize } = require('sequelize');
const { Contract, Job, Profile, sequelize } = require('../models');

async function depositToClient(userId, depositAmount) {
 

  try {
    return 	await sequelize.transaction(async (t) => {
       const client = await Profile.findOne({
				where: {
					id: userId
				},
				include: [{
					model: Contract,
					as: 'Client',
					include: {
						model: Job,
						where: {
							paid: {
								[Sequelize.Op.not]: true
							},
						},
						attributes: [
							[Sequelize.fn('SUM', Sequelize.col('price')), 'totalJobsToPay']
						]
					}
				}]
			});

      if (!client) {
        throw new Error('Client not found');
      }

      const totalJobsToPay = client.Client.reduce((sum, contract) => {
        return sum + (contract.Jobs.length > 0 ? parseFloat(contract.Jobs[0].dataValues.totalJobsToPay) : 0);
    }, 0) || 0;
      const maxDeposit = totalJobsToPay * 0.25;

      if (depositAmount > maxDeposit) {
        throw new Error('Deposit '+depositAmount+' exceeds 25% of total jobs to pay of '+maxDeposit+ ' max dep of jobs '+totalJobsToPay );
      }

      const updatedBalance = client.balance + depositAmount;
      await Profile.update(
        { balance: updatedBalance },
        { where: { id: userId }, transaction: t }
      );

      return { message: 'Deposit successful', newBalance: updatedBalance };
    });
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { depositToClient };
