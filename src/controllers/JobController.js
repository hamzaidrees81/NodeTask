

async function  getUnpaidJobs(req, res) {
    // Profile id of requester
    const profileId = req.get('profile_id');
    const { Job, Contract, Profile } = req.app.get('models');

    try {
        const unpaidJobs = await Job.findAll({
            include: [{
                model: Contract,
                include: [
                    { model: Profile, as: 'Contractor' },
                    { model: Profile, as: 'Client' }
                ],
                where: {
                    [Sequelize.Op.or]: [
                        { ContractorId: profileId },
                        { ClientId: profileId }
                    ],
                    status: 'in_progress' // Assuming there's a field 'status' in Contract model representing contract status
                },
                model: Contract
                
            }],
            where: { [Sequelize.Op.or]: [{ paid: false }, { paid: null }] } // DOES NOT WORK
        });

        res.json(unpaidJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports[getUnpaidJobs];