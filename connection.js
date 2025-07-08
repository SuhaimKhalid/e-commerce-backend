const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`) });

const config = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD || '',
  port: process.env.PGPORT || 5432,
};

if (process.env.NODE_ENV === 'production') {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false };
}

const db = new Pool(config);

module.exports = db;
