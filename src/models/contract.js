const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize'); 

class Contract extends Model {}
Contract.init(
  {
    terms: {
      type: DataTypes.TEXT, 
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'terminated'),
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

module.exports = Contract;