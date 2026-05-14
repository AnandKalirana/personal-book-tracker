const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

const dotenv = require('dotenv');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixDatabase() {
    console.log('🚀 Starting production database fix...');
    
    // Use environment variables for security
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
        console.log('✅ Connected to Railway database.');

        const tables = ['books', 'users', 'reading_stats'];
        
        for (const table of tables) {
            console.log(`\n🛠️ Checking table: ${table}...`);
            
            // Check if column exists
            const [columns] = await connection.query(`SHOW COLUMNS FROM ${table}`);
            const columnNames = columns.map(c => c.Field);
            
            if (!columnNames.includes('updated_at')) {
                console.log(`➕ Adding 'updated_at' to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            } else {
                console.log(`✅ 'updated_at' already exists in ${table}.`);
            }

            if (!columnNames.includes('created_at')) {
                console.log(`➕ Adding 'created_at' to ${table}...`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
            } else {
                console.log(`✅ 'created_at' already exists in ${table}.`);
            }
        }

        console.log('\n✨ Database structure fixed successfully!');
        await connection.end();
    } catch (error) {
        console.error('❌ Database fix failed:', error.message);
        process.exit(1);
    }
}

fixDatabase();
