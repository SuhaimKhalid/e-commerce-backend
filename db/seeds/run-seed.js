const db = require('../connection');

const seedData = async () => {
  try {
    await db.query(`DROP TABLE IF EXISTS users;`);
    await db.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    await db.query(`INSERT INTO users (username) VALUES ('Alice'), ('Bob');`);

    console.log('Seed data inserted successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await db.end();
  }
};

seedData();
