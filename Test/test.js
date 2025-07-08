const db = require('../db/connection');

(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connected! Server time:', result.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await db.end();
  }
})();
