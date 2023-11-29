const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize'); // Import the Sequelize instance

class Contract extends Model {}
Contract.init(
  {
    terms: {
      type: DataTypes.TEXT, // Change Sequelize.TEXT to DataTypes.TEXT
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'terminated'), // Use DataTypes.ENUM
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

module.exports = Contract; // Don't forget to export the Contract model
