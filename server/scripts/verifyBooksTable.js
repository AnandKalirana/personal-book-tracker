const mysql = require('mysql2/promise');

async function verify() {
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
        const [columns] = await connection.query('SHOW COLUMNS FROM books');
        console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));
        await connection.end();
    } catch (e) { console.error(e); }
}
verify();
