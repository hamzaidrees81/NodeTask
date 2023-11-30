const { getBestProfession, getBestClients } = require('../services/adminService');
const InvalidParamException = require('../errors/InvalidParamException');
const ContentNotFoundException = require('../errors/ContentNotFoundException');
const MissingParamException = require('../errors/MissingParamException');

async function findBestProfession(req, res) {
  try {
    const { start, end } = req.query;

    const { startDate, endDate } = validateDates(start, end);
  
    const result = await getBestProfession(startDate, endDate);

    if (!result) {
      throw new Error('No data found for the given criteria.');
    }

    res.status(200).json({bestProfession:result});
  } catch (error) {
      console.log(error);
      return res.status(error.status || 500).json({
       error: error.message,
    });
  
  }
}

async function findBestClients(req, res) {
  try {
    const { start, end, limit = 2 } = req.query;

    const { startDate, endDate } = validateDates(start, end);
  
    if (!Number.isInteger(parseInt(limit))) {
      throw new InvalidParamException('Limit should be an integer.');
    }

    const results = await getBestClients(startDate, endDate, limit);

    if (results.length === 0) {
      throw new ContentNotFoundException('No data found for the given criteria.');
    }

    res.status(200).json(results);
  } catch (error) {
    console.log(error); 
      return res.status(error.status || 500).json({
        error: error.message,
    });
  }
}

function validateDates(start, end) {
  if (!start || !end) {
    throw new MissingParamException('Please provide both start and end dates.');
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate)) {
    throw new InvalidParamException('Please provide correct start and end dates.');
  }

  return { startDate, endDate };
}

module.exports = { findBestProfession, findBestClients };
