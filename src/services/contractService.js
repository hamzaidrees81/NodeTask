const { Contract } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * get contract by id
 * @param {*} profileId 
 * @param {*} contractId 
 * @returns 
 */
async function getContractById(profileId, contractId) {
    const contract = await Contract.findOne({
        where: {
            id: contractId,
            [Sequelize.Op.or]: [
                { contractorId: profileId },
                { clientId: profileId }
            ]
        }
    });
    return contract;
}

/**
 * get all contracts of a profile
 * @param {*} profileId 
 * @returns 
 */
async function getContractsByProfile(profileId) {
    const contracts = await Contract.findAll({
        where: {
            [Sequelize.Op.or]: [
                { contractorId: profileId },
                { clientId: profileId }
            ],
            [Sequelize.Op.not]: [{ status: 'terminated' }]
        }
    });
    return contracts;
}

module.exports = {
    getContractById,
    getContractsByProfile
};
