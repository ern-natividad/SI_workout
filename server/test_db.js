import mysql from "mysql2/promise";

(async ()=>{
  try{
    const cfg = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000
    };
    console.log("=== DB connectivity test ===");
    console.log("Testing DB connection with:", { host: cfg.host, port: cfg.port, database: cfg.database });
    const conn = await mysql.createConnection(cfg);
    const [rows] = await conn.execute("SELECT 1 AS ok");
    console.log("DB test success:", rows);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error("DB test error:");
    console.error(err);
    process.exit(1);
  }
})();
