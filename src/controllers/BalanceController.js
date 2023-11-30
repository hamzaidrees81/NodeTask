const { depositToClient } = require('../services/balanceService');

async function depositBalance(req, res) {
  const userId = req.params.userId;
  const depositAmount = parseFloat(req.body.amount);

  try {

	if (isNaN(depositAmount)) {
		throw new Error('Invalid amount passed');
	}

	
	if (isNaN(userId)) {
		throw new Error('User id is missing.');
	}

    const result = await depositToClient(userId, depositAmount);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { depositBalance };
