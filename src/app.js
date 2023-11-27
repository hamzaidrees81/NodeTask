const express = require('express');
const bodyParser = require('body-parser');
const {sequelize, Contract} = require('./models/model')
const {getProfile} = require('./middleware/getProfile')
const Sequelize = require('sequelize');
const app = express();



app.use(bodyParser.json());
app.use(getProfile)
app.set('sequelize', sequelize)
app.set('models', sequelize.models)
const jobRoutes = require('./routers/jobs');
const adminRoutes = require('./routers/admin');
const contractRoutes = require('./routers/contracts');
const balanceRoutes = require('./routers/balance');

app.use('/jobs', jobRoutes)
app.use('/admin', adminRoutes)
app.use('/contracts', contractRoutes)
app.use('/balances', balanceRoutes)




module.exports = app;
