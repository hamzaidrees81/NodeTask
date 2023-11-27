const {
	Sequelize
} = require('sequelize');
const {
	Contract,
	Job,
	Profile,
	sequelize
} = require('../models')

/**
 * deposit balance to a client
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function depositBalance(req, res) {
	const userId = req.params.userId;
	const depositAmount = parseFloat(req.body.amount); //amount is sent in the request body

	if (isNaN(depositAmount)) {
		res.status(400).json({
			error: 'Invalid amount passed'
		});
	}

	try {

		await sequelize.transaction(async (t) => {
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
				return res.status(400).json({
					error: 'Client not found'
				});
			}

			const totalJobsToPay = client.Client.reduce((sum, contract) => {
				return sum + (contract.Jobs.length > 0 ? parseFloat(contract.Jobs[0].dataValues.totalJobsToPay) : 0);
			}, 0) || 0;

			const maxDeposit = totalJobsToPay * 0.25; // Calculate 25% of total jobs to pay

			if (depositAmount > maxDeposit) {
				return res.status(400).json({
					error: 'Deposit exceeds 25% of total jobs to pay'
				});
			}

			// Update the balance within the transaction
			const updatedBalance = client.balance + depositAmount;
			await Profile.update({
				balance: updatedBalance
			}, {
				where: {
					id: userId
				},
				transaction: t
			});

			res.json({
				message: 'Deposit successful',
				newBalance: updatedBalance
			});
		});

	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: 'Internal server error'
		});
	}

}

module.exports = {
	depositBalance
}