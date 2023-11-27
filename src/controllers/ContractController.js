
const {Sequelize} = require('sequelize');
 

/**
 * @returns get a contract by id
 */
async function getContractById (req, res) {

    //profile id of requester because we only show contract to relevant stakeholder
    profileId = req.get('profile_id')
    const {Contract} = req.app.get('models')
    const {id} = req.params
    
    //return a contract if the profile matches a client or contractor
    const contract = await Contract.findOne({where: {id , 
            [Sequelize.Op.or]: [
            { contractorId: profileId },
            { clientId: profileId } 
        ]
    }});

    if(!contract) return res.status(404).end()
    res.json(contract)
}

/**
 * @returns all contract
 */

async function getAllContracts (req, res) {
  
    //profile id of requester
    profileId = req.get('profile_id')
    const {Contract} = req.app.get('models')
    
    //return a contract if the profile matches a client or contractor
    const contract = await Contract.findAll({where: {
            [Sequelize.Op.or]: [
            { contractorId: profileId },
            { clientId: profileId } 
        ]
        ,
        [Sequelize.Op.not ]: [{status: 'terminated'}]        
    }});

    if (contract.length === 0) {
        return res.status(200).json({ error: 'No data found' });
    }

    res.json(contract)
}

module.exports = {getAllContracts, getContractById}