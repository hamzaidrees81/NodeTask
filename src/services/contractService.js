const { Contract } = require('../models');
const { Sequelize } = require('sequelize');

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
