const mysql = require('mysql2/promise');

async function listTables() {
    const config = {
        host: 'turntable.proxy.rlwy.net',
        user: 'root',
        password: 'MQyVbpbeBIgaHSOBynjXURIIiLQPjAmr',
        database: 'railway',
        port: 50694,
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
