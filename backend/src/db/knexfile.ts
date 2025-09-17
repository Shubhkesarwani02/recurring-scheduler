import knex from 'knex';

const config = {
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5VYfzAoLbyJ1@ep-old-credit-aebcivqu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
  },
  pool: {
    min: 2,
    max: 10
  }
};

const db = knex(config);

export default db;