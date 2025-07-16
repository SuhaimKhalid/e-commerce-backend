const db = require("../connection");
const format = require("pg-format"); //for inserting

const seed = async (data) => {
  try {
    // Droping Tables
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
        product_variants,
        products,
        categories,
        admins,
        users
      CASCADE;
    `);
    // Creating Tables
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

CREATE TABLE product_variants (
  variant_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price NUMERIC,
  stock_quantity INT DEFAULT 0
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

    // Insert Data in Tables
    // User Table

    const usersValues = data.usersData.map((obj) => {
      return [obj.username, obj.email, obj.password];
    });
    await db.query(
      format(
        `
  INSERT INTO users (username, email, password)
  VALUES %L;
`,
        usersValues
      )
    );

    // admin Table
    const adminValues = data.adminsData.map((obj) => {
      return [obj.name];
    });
    await db.query(
      format(
        `
    INSERT INTO admins (name) VALUES %L;`,
        adminValues
      )
    );

    // Categories Table
    const categoriesValues = data.categoriesData.map((obj) => {
      return [obj.name];
    });
    const insertCategoriesQuery = format(
      `
  INSERT INTO categories (name)
  VALUES %L
  RETURNING *;
`,
      categoriesValues
    );
    const { rows: insertedCategories } = await db.query(insertCategoriesQuery);

    // Products Table
    const productsValue = data.productsData.map((obj) => {
      const category = insertedCategories.find((data) => {
        return data.name === obj.categoryName;
      });
      return [
        obj.name,
        obj.description,
        obj.price,
        category ? category.category_id : null,
      ];
    });
    const insertProductQuery = format(
      `INSERT INTO products (name,description,price,category_id) VALUES %L RETURNING *;`,
      productsValue
    );
    const { rows: insertedProducts } = await db.query(insertProductQuery);

    //Product Variants Table
    const productVariantsValue = data.productsVariants.map((obj) => {
      const product = insertedProducts.find((product) => {
        return product.name === obj.productName;
      });
      return [
        product ? Number(product.product_id) : null,
        obj.variant_name,
        obj.sku,
        obj.price,
        obj.stock_quantity,
      ];
    });
    const insertProductVariantQuery = format(
      `INSERT INTO product_variants (product_id,variant_name,sku,price,stock_quantity) VALUES %L RETURNING *;`,
      productVariantsValue
    );
    const { rows: insertedProductVariants } = await db.query(
      insertProductVariantQuery
    );

    // Product Images Table
    const productImagesValues = data.product_images_Data.map((data) => {
      const productVariants = insertedProducts.find((p) => {
        return p.name === data.productName;
      });
      return [
        productVariants ? productVariants.product_id : null,
        data.image_url,
      ];
    });
    await db.query(
      format(
        `INSERT INTO product_images (product_id, image_url) VALUES %L RETURNING *;`,
        productImagesValues
      )
    );

    console.log("Seed data inserted successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  }
};

module.exports = seed;
