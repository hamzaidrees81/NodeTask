const contractService = require('../services/contractService');
const InvalidParamException = require('../errors/InvalidParamException');
const ContentNotFoundException = require('../errors/ContentNotFoundException');
const UnauthorizedException = require('../errors/UnauthorizedException');

async function getContractById(req, res) {
    const profileId = req.get('profile_id');
    const { id } = req.params;

    try {
        if (!id || isNaN(Number(id))) {
            throw new UnauthorizedException('Invalid contract id. Please send correct contract id.');
        } 

        const contract = await contractService.getContractById(profileId, id);
        if (!contract) {
            throw new ContentNotFoundException(`Cannot find contact with id ${id}`);
        }
        res.json(contract);
    } 
     catch (error) {
        console.log(error);
        return res.status(error.code || 500).json({
        error: error.message,
        }).end();
    
      }
}

async function getContractsByProfile(req, res) {
    const profileId = req.get('profile_id');

    try {
        const contracts = await contractService.getContractsByProfile(profileId);
        if (contracts.length === 0) { 
            return res.status(200).json({ error: 'No data found' });
        }
        res.status(200).json(contracts).end();
    }  
    catch (error) {
        console.log(error);
        return res.status(error.code || 500).json({
            error: error.message,
        }).end();
    
  }
}

module.exports = {
    getContractsByProfile,
    getContractById
};
