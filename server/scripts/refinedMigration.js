const mysql = require('mysql2/promise');

const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function refinedMigration() {
    console.log('🚀 Starting Refined Migration for Railway Production...');
    
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        ssl: { rejectUnauthorized: false }
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to Railway.');

        // Helper to add column if it doesn't exist
        async function addColumnIfMissing(table, column, definition) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const exists = columns.some(c => c.Field === column);
            if (!exists) {
                console.log(`➕ Adding ${column} to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
            } else {
                console.log(`✅ ${column} already exists in ${table}.`);
            }
        }

        // 1. Tables (Safe with IF NOT EXISTS)
        await connection.query(`CREATE TABLE IF NOT EXISTS reading_stats (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            books_read INT DEFAULT 0,
            total_pages INT DEFAULT 0,
            current_streak INT DEFAULT 0,
            best_streak INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
        console.log('✅ reading_stats table verified.');

        // 2. User Columns
        await addColumnIfMissing('users', 'is_public', 'BOOLEAN DEFAULT TRUE');
        await addColumnIfMissing('users', 'bio', 'TEXT');
        await addColumnIfMissing('users', 'avatar_url', 'TEXT');

        // 3. Book Columns
        await addColumnIfMissing('books', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        await addColumnIfMissing('books', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        console.log('\n✨ Refined Migration Complete! All tables and columns are synced.');
        await connection.end();
    } catch (error) {
        console.error('❌ Refined Migration failed:', error.message);
        process.exit(1);
    }
}

refinedMigration();
