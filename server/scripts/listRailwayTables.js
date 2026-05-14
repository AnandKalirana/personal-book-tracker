const mysql = require('mysql2/promise');

const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function listTables() {
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
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Current tables on Railway:', tables.map(t => Object.values(t)[0]));
        await connection.end();
    } catch (e) { console.error(e); }
}
listTables();
