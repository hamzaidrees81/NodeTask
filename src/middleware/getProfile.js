const UnauthorizedException = require('../errors/UnauthorizedException');

const {
	Profile
} = require('../models')

/**
 * this works as an authentication mechanism based on matching the profie_id
 * @param {} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const getProfile = async (req, res, next) => {

	const profileId = req.get('profile_id');

	try {
		if (!profileId || isNaN(Number(profileId))) {
			throw new UnauthorizedException('Cannot authorize for profileId. Please check if correct profileid is given.')
		} 
		const profile = await Profile.findOne({
			where: {
				id: profileId
			}
		})
		if (!profile)
		{ 
			throw new UnauthorizedException('Authorization failed, profile does not exist.');
		}
		req.profile = profile;
		next();
	}
	catch(error)
	{
		console.log(error);
		return res.status(error.code | 500).json({ error: error.message }).end();
	}
	
}

module.exports = {
	getProfile
}