import db from '../connection.js';

(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connected successfully!');
    console.log('Server time:', result.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    db.end(); // Close connection
  }
})();
