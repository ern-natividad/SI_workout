import mysql from 'mysql2/promise';

// This script connects to a local MySQL (XAMPP) instance for testing.
// It prefers TEST_DB_* env vars but falls back to common XAMPP defaults.

const cfg = {
  host: process.env.TEST_DB_HOST || '127.0.0.1',
  port: process.env.TEST_DB_PORT ? Number(process.env.TEST_DB_PORT) : 3306,
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'workout_app',
  connectTimeout: process.env.TEST_DB_CONNECT_TIMEOUT ? Number(process.env.TEST_DB_CONNECT_TIMEOUT) : 10000,
};

(async function run() {
  console.log('Local DB test config (non-secret):', { host: cfg.host, port: cfg.port, database: cfg.database });
  let conn;
  try {
    conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: cfg.connectTimeout,
    });

    const [version] = await conn.query('SELECT VERSION() AS v');
    console.log('MySQL version:', version[0].v);

    const [ok] = await conn.query('SELECT 1 AS ok');
    console.log('Quick SELECT result:', ok);

    // List a few tables as a sanity check
    const [tables] = await conn.query("SHOW TABLES LIMIT 20");
    console.log('Tables (sample):', tables.map(r => Object.values(r)[0]));

    console.log('\nLocal DB connection test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('\nLocal DB connection test failed:');
    console.error(err && err.message ? err.message : err);
    if (err && err.code) console.error('Error code:', err.code);
    process.exit(1);
  } finally {
    if (conn) await conn.end().catch(()=>{});
  }
})();
