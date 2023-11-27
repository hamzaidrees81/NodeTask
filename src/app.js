const express = require('express');
const bodyParser = require('body-parser');
const {
	sequelize
} = require('./models')
const {
	getProfile
} = require('./middleware/getProfile')
const app = express();



app.use(bodyParser.json());
app.use(getProfile)
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

const routes = require('./routes');
app.use(routes);



module.exports = app;