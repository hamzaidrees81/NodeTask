const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize'); // Import the Sequelize instance

class Profile extends Model {}

Profile.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0 // Providing a default value for balance
    },
    type: {
      type: DataTypes.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

module.exports = Profile;
