const express = require('express');
const app = express();
const sequelize = require('./sequelize');
const Profile = require('./profile');
const Job = require('./job');
const Contract = require('./contract');

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'})
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'})
Contract.belongsTo(Profile, {as: 'Contractor'})
Contract.belongsTo(Profile, {as: 'Client'})
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job
};
