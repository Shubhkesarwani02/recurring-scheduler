import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/recurring_scheduler',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10
  }
};

const db = knex(config);

export default db;