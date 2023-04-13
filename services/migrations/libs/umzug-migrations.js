require('dotenv').config();

// var connectDB = require('../../../layers/models_lib/dist/nodejs/node_modules/models/db').connectDB;
var { connectDB } = require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.INFRA_STAGE + '_database', '', process.env.SECRET_ARN, false);

const Umzug = require('umzug');

const umzug = new Umzug({
    migrations: {
        path: './migrations',
        params: [db.sequelize.getQueryInterface(), db.Sequelize]
    },
    storage: 'sequelize',
    storageOptions: {
        sequelize: db.sequelize
    }
});

module.exports = { umzug };
