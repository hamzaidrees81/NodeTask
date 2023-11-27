const {Profile} = require('../models')

/**
 * this works as an authentication mechanism based on matching the profie_id
 * @param {} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const getProfile = async (req, res, next) => {
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) return res.status(401).end()
    req.profile = profile
    next()
}

module.exports = {getProfile}