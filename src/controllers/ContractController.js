const {
	Sequelize
} = require('sequelize');
const {
	Contract
} = require('../models');


/**
 * @returns get a contract by id
 */
async function getContractById(req, res) {

	//profile id of requester because we only show contract to relevant stakeholder
	const profileId = req.get('profile_id')
	const {
		id
	} = req.params

	//return a contract if the profile matches a client or contractor
	const contract = await Contract.findOne({
		where: {
			id,
			[Sequelize.Op.or]: [{
					contractorId: profileId
				},
				{
					clientId: profileId
				}
			]
		}
	});

	if (!contract) return res.status(404).end()
	res.json(contract)
}

/**
 * @returns all contract
 */

async function getContractsByProfileId(req, res) {

	//profile id of requester
	profileId = req.get('profile_id')

	//return list of contracts if the profile matches a client or contractor
	const contracts = await Contract.findAll({
		where: {
			[Sequelize.Op.or]: [{
					contractorId: profileId
				},
				{
					clientId: profileId
				}
			],
			[Sequelize.Op.not]: [{
				status: 'terminated'
			}]
		}
	});

	if (contracts.length === 0) {
		return res.status(200).json({
			error: 'No data found'
		});
	}

	res.json(contracts)
}

module.exports = {
	getContractsByProfileId,
	getContractById
}