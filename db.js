// db.js : connexion MySQL partagée par les 3 membres
require('dotenv').config();
const mysql = require('mysql2');

// Un "pool" gère plusieurs connexions réutilisables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// On exporte la version "promise" pour utiliser async/await
module.exports = pool.promise();