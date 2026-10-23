const healthService = require('../services/health.service');

const getHealth = (req, res) => {
  const data = healthService.getHealthData();

  res.status(200).json(data);
};

module.exports = {
  getHealth
};
