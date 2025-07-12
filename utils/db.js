require('dotenv').config();
const pg = require('pg');
const { Sequelize } = require('sequelize');
const environment = process.env.NODE_ENV;
const config = require('../config/config');

const dbConfig = config[environment]; //is same as config.development
console.log(dbConfig);
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
 host: dbConfig.host,
 port: dbConfig.port,
 dialect: dbConfig.dialect,
 dialectModule: pg,
 logging: false,
 dialectOptions: {
  ssl: {
   require: true,
   rejectUnauthorized: false,
  },
 },
});

module.exports = sequelize;
