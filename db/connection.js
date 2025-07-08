const { Pool } = require('pg');
require('dotenv').config(); // Automatically loads `.env`, `.env.test`, etc.

const ENV = process.env.NODE_ENV || 'development';

const config = {};

if (ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false };
  config.max = 2;
} else {
  config.user = process.env.PGUSER;
  config.host = process.env.PGHOST;
  config.database = process.env.PGDATABASE;
  config.password = process.env.PGPASSWORD;
  config.port = process.env.PGPORT || 5432;
}

const db = new Pool(config);

module.exports = db;
