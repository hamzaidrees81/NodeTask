const { Sequelize } = require('sequelize');
const { Job, Contract, Profile } = require('../models');
const ContentNotFoundException = require('../errors/ContentNotFoundException');

/**
 * fetch best profession by maximum sum of price of jobs
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */

async function getBestProfession(startDate, endDate) {
  
  const result = await Job.findOne({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('price')), 'totalEarning']
    ],
    include: [{
      model: Contract,
      attributes: ['clientId'],
      include: {
        model: Profile,
        as: 'Client',
        attributes: ['profession']
      }
    }],
    where: {
      paid: true,
      paymentDate: {
        [Sequelize.Op.between]: [startDate, endDate]
      }
    },
    group: ['Contract.Client.profession'],
    order: [
      [Sequelize.literal('totalEarning'), 'DESC']
    ]
  });
  
  if (!result) {
    throw new ContentNotFoundException('No data found for the given criteria.');
  }
  
  return result.Contract.Client.profession;
}

/**
 * get clients who earned most during a tenure
 * @param {*} startDate 
 * @param {*} endDate 
 * @param {*} limit 
 * @returns 
 */
async function getBestClients(startDate, endDate, limit) {
  
  const results = await Job.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('price')), 'totalJobCost'],
      [
        Sequelize.literal("`Contract->Client`.`firstName` || ' ' || `Contract->Client`.`lastName`"),
        'fullName' // Concatenated full name alias
      ]
    ],
    include: [{
      model: Contract,
      attributes: [],
      include: {
        model: Profile,
        as: 'Client',
        attributes: []
      }
    }],
    where: {
      paid: true,
      paymentDate: {
        [Sequelize.Op.between]: [startDate, endDate]
      }
    },
    group: ['Contract.ClientId'],
    order: [
      ['totalJobCost', 'DESC']
    ],
    limit: parseInt(limit),
    raw: true
  });

  if (results.length === 0) {
    throw new ContentNotFoundException('No data found for the given criteria.');
  }
  
  return results;
}

module.exports = { getBestProfession, getBestClients };
