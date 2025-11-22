import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDb = async () => {
    const client = await pool.connect();
    try {
        // Create ENUM type if it doesn't exist
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE order_status AS ENUM ('pending', 'routing', 'building', 'submitted', 'confirmed', 'failed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        token_in VARCHAR(50) NOT NULL,
        token_out VARCHAR(50) NOT NULL,
        amount DECIMAL NOT NULL,
        status order_status NOT NULL,
        tx_hash VARCHAR(100),
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Database initialized');
    } catch (err) {
        console.error('Error initializing database', err);
    } finally {
        client.release();
    }
};
