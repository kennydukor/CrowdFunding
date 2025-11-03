// require('dotenv').config();
// const pg = require('pg');
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//  host: process.env.DB_HOST,
//  port: process.env.DB_PORT,
//  dialect: 'postgres',
//  dialectModule: pg,
//  logging: false,
//  ...(process.env === 'production' && {
//   dialectOptions: {
//    ssl: {
//     require: process.env === 'production',
//     rejectUnauthorized: false,
//    },
//   },
//  }),
// });

// module.exports = sequelize;

require('dotenv').config();
const { Sequelize } = require('sequelize');
const pg = require('pg');
const dbConfig = require('../config/config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
 host: dbConfig.host,
 port: dbConfig.port,
 dialect: dbConfig.dialect,
 dialectModule: pg,
 logging: dbConfig.logging,
 dialectOptions: dbConfig.dialectOptions || {},
});

module.exports = sequelize;
