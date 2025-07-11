const db = require('../connection');
const format = require("pg-format"); //for inserting

const seedData = async () => {
  try {
    await db.query(`
      DROP TABLE IF EXISTS
        reviews,
        addresses,
        payments,
        order_items,
        orders,
        cart_items,
        inventory,
        product_images,
        products,
        categories,
        admins,
        users
      CASCADE;
    `);

   await db.query(`
  CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL
  );

  CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
  );

  CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL
  );

  CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL
  );

  CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price NUMERIC NOT NULL
  );

  CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    status TEXT DEFAULT 'completed'
  );

  CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    street TEXT,
    city TEXT,
    postcode TEXT,
    country TEXT
  );

  CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT
  );
`);




  

    console.log('Seed data inserted successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await db.end();
  }
};

seedData();
