const {	Sequelize } = require('sequelize');
const {	sequelize, Job, Contract, Profile } = require('../models');

/**
 * this return best profession that had maximum amount earned from jobs
 * @param {} req 
 * @param {*} res 
 * @returns 
 */
async function getBestProfession(req, res) {
	const {start, end } = req.query;

	//check if start or end is provided
	if (!start || !end) {
		console.error('Please provide both start and end dates.');
		return res.status(400).json({
			error: 'Please provide both start and end dates.'
		});
	}

	const startDate = new Date(start);
	const endDate = new Date(end);

	if (isNaN(startDate) || isNaN(endDate)) {
		console.error('Please provide correct start and end dates.');
		return res.status(400).json({
			error: 'Please provide correct start and end dates.'
		});
	}

	const result = await Job.findOne({
		attributes: [
			[sequelize.fn('SUM', sequelize.col('price')), 'totalEarning']
		],
		include: [{
			model: Contract,
			attributes: ['clientId'],
			include: [{
				model: Profile,
				as: 'Client',
				attributes: ['profession']
			}]
		}],
		where: {
			paid: true,
			paymentDate: {
				[Sequelize.Op.between]: [startDate, endDate]
			}
		},
		group: ['profession'],
		order: [
			['totalEarning', 'DESC']
		]
	});

	if (!result) {
		console.error('No data found for the given criteria.');
		return res.status(200).json({
			error: 'No data found for the given criteria.'
		});
	}

	res.status(200).json(result.Contract.Client.profession)
}

/**
 * retrieve list of best clients in a timeperiod with a limit on records
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function getBestClients(req, res) {
	const {
		start,
		end,
		limit = 2
	} = req.query;

	//check if start or end is provided
	if (!start || !end) {
		console.error('Please provide both start and end dates.');
		return res.status(400).json({
			error: 'Please provide both start and end dates.'
		});
	}

	const startDate = new Date(start);
	const endDate = new Date(end);

	if (isNaN(startDate) || isNaN(endDate)) {
		console.error('Invalid start date input');
		console.error('Please provide correct start and end dates.');
		return res.status(400).json({
			error: 'Please provide correct start and end dates.'
		});
	}


	// Check if parsedLimit is a valid integer
	if (!Number.isInteger(parseInt(limit))) {
		console.error('Limit should be an integer.');
		return res.status(400).json({
			error: 'Limit should be an integer.'
		});
	}

	const results = await Job.findAll({
		attributes: [
			[sequelize.fn('SUM', sequelize.col('price')), 'totalJobCost'],
			[
				sequelize.literal("`Contract->Client`.`firstName` || ' ' || `Contract->Client`.`lastName`"),
				'fullName' // Concatenated full name alias
			]
		],
		include: [{
			model: Contract,
			attributes: [],
			include: [{
				model: Profile,
				as: 'Client',
				attributes: []
			}]
		}],
		where: {
			paid: true,
			paymentDate: {
				[Sequelize.Op.between]: [startDate, endDate]
			}
		},
		group: ['ClientId'],
		order: [
			['totalJobCost', 'DESC']
		],
		limit: limit,
		raw: true
	});

	if (results.length === 0) {
		console.error('No data found for the given criteria.');
		return res.status(200).json({
			error: 'No data found for the given criteria.'
		});
	}

	res.status(200).json(results);
}

module.exports = {
	getBestProfession,
	getBestClients
}