
const getProfile = async (req, res, next) => {
    const {Profile} = req.app.get('models')
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) return res.status(401).end()
    req.profile = profile
    next()
}

const getAllProfiles = async(req, res, next) =>
{
    try {
    const profiles = await Profile.findAll()
    if(!profiles || profiles.length === 0)
     return res.status(401).end()
    
    req.profiles = profiles;

    next();
    } catch (error) {
        console.error(error);
        return res.status(500).end(); // Handle any errors that occur during retrieval
    }
   
}

module.exports = {  getAllProfiles} 