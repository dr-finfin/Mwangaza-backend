import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create tables on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id TEXT NOT NULL,
    lesson_name TEXT,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => {
  console.log('Database tables ready');
}).catch((err) => {
  console.error('Failed to initialise database tables:', err);
});

export default pool;
