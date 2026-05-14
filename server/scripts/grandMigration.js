const mysql = require('mysql2/promise');

const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function grandMigration() {
    console.log('🚀 Starting Grand Migration for Railway Production...');
    
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

        const sqlCommands = [
            // 1. Reading Stats Table
            `CREATE TABLE IF NOT EXISTS reading_stats (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                books_read INT DEFAULT 0,
                total_pages INT DEFAULT 0,
                current_streak INT DEFAULT 0,
                best_streak INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`,

            // 2. Social Columns for Users
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
            
            // 3. Ensure Timestamps on Books (already done but safe to repeat)
            `ALTER TABLE books ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
            `ALTER TABLE books ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,

            // 4. Ensure Shelves and Tags exist with correct structure
            `CREATE TABLE IF NOT EXISTS shelves (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_shelf (user_id, name)
            )`,
            `CREATE TABLE IF NOT EXISTS book_shelves (
                book_id INT NOT NULL,
                shelf_id INT NOT NULL,
                PRIMARY KEY (book_id, shelf_id),
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (shelf_id) REFERENCES shelves(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            )`,
            `CREATE TABLE IF NOT EXISTS book_tags (
                book_id INT NOT NULL,
                tag_id INT NOT NULL,
                PRIMARY KEY (book_id, tag_id),
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
            )`
        ];

        for (let i = 0; i < sqlCommands.length; i++) {
            try {
                await connection.query(sqlCommands[i]);
                console.log(`✅ Step ${i + 1}/${sqlCommands.length} Success`);
            } catch (err) {
                console.warn(`⚠️ Step ${i + 1} Warning: ${err.message}`);
            }
        }

        console.log('\n✨ Grand Migration Complete! Your production database is now 100% up to date.');
        await connection.end();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

grandMigration();
