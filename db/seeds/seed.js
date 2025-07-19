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
  product_variant_id SERIAL PRIMARY KEY,
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
  product_variant_id INT REFERENCES product_variants(product_variant_id) ON DELETE CASCADE,
  quantity INT NOT NULL
);

CREATE TABLE cart_items (
  cart_item_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
  product_variant_id INT REFERENCES product_variants(product_variant_id) ON DELETE CASCADE,
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
  product_variant_id INT REFERENCES product_variants(product_variant_id) ON DELETE CASCADE,
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
    const inseretUserQuery = format(
      `INSERT INTO users (username, email, password)
  VALUES %L RETURNING *;`,
      usersValues
    );
    const { rows: insertedUsers } = await db.query(inseretUserQuery);

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
      const productRef = insertedProducts.find((p) => {
        return p.name === data.productName;
      });
      return [productRef ? productRef.product_id : null, data.image_url];
    });
    await db.query(
      format(
        `INSERT INTO product_images (product_id, image_url) VALUES %L RETURNING *;`,
        productImagesValues
      )
    );

    // Inventory Table
    const inventoryValues = data.inventoryData.map((data) => {
      const productRef = insertedProducts.find((p) => {
        return p.name === data.productName;
      });

      const productVariantsRef = insertedProductVariants.find((p) => {
        return (
          p.variant_name === data.variant_name &&
          p.product_id === productRef?.product_id
        );
      });
      return [productVariantsRef?.product_variant_id || null, data.quantity];
    });
    const insertInventoryQuery = format(
      `INSERT INTO inventory (product_variant_id,quantity) VALUES %L RETURNING *;`,
      inventoryValues
    );
    const { rows: insertedInventory } = await db.query(insertInventoryQuery);

    // Cart Item Table
    const CartItemsValues = data.cart_items_Data.map((data) => {
      const userRef = insertedUsers.find((u) => {
        return u.username === data.username;
      });

      const productRef = insertedProducts.find((p) => {
        return p.name === data.productName;
      });
      const productVariantRef = insertedProductVariants.find((pv) => {
        return (
          pv.variant_name === data.variant_name &&
          pv.product_id === productRef?.product_id
        );
      });
      return [
        userRef ? userRef.user_id : null,
        productRef ? productRef.product_id : null,
        productVariantRef ? productVariantRef.product_variant_id : null,
        data.quantity,
      ];
    });

    const insertCartItemsQuery = format(
      `INSERT INTO cart_items (user_id, product_id, product_variant_id, quantity) VALUES %L RETURNING *;`,
      CartItemsValues
    );

    const { rows: insertedCartItems } = await db.query(insertCartItemsQuery);
    // orders Table
    const ordersValues = data.orderData.map((data) => {
      const userRef = insertedUsers.find((u) => {
        return u.username === data.username;
      });
      return [userRef ? userRef.user_id : null, data.total, data.status];
    });
    const insertOrdersQuery = format(
      `INSERT INTO orders (user_id, total,status) VALUES %L RETURNING *;`,
      ordersValues
    );
    const { rows: insertedOrders } = await db.query(insertOrdersQuery);

    // order_items Table
    const orderItemsValues = data.order_items_Data.map((data) => {
      const orderRef = insertedOrders.find((o) => {
        return o.order_id === data.orderId;
      });
      const productRef = insertedProducts.find(
        (p) => p.name === data.productName
      );
      const productVariantRef = insertedProductVariants.find((v) => {
        return (
          v.variant_name === data.variant_name &&
          v.product_id === productRef?.product_id
        );
      });
      return [
        orderRef ? orderRef.order_id : null,
        productVariantRef ? productVariantRef.product_variant_id : null,
        data.quantity,
        data.price,
      ];
    });

    const insertOrderItemsQuery = format(
      `INSERT INTO order_items (order_id, product_variant_id, quantity,price) VALUES %L RETURNING *;`,
      orderItemsValues
    );
    const { rows: insertedOrderItems } = await db.query(insertOrderItemsQuery);

    // payments Table
    const paymentsValues = data.paymentsData.map((data) => {
      const orderRef = insertedOrders.find((o) => {
        return o.order_id === data.orderId;
      });
      return [
        orderRef ? orderRef.order_id : null,
        data.amount,
        data.method,
        data.status,
      ];
    });
    const insertPaymentQuery = format(
      `INSERT INTO payments (order_id,amount,method,status) VALUES %L RETURNING *;`,
      paymentsValues
    );
    const { rows: insertedPayment } = await db.query(insertPaymentQuery);

    // addresses Table
    const addressesValues = data.addressesData.map((data) => {
      const userRef = insertedUsers.find((u) => {
        return u.username === data.username;
      });
      return [
        userRef ? userRef.user_id : null,
        data.street,
        data.city,
        data.postcode,
        data.country,
      ];
    });
    const insertAddressesQuery = format(
      `INSERT INTO addresses (user_id,street,city,postcode,country)  VALUES %L RETURNING *;`,
      addressesValues
    );
    const { rows: insertedAddresses } = await db.query(insertAddressesQuery);

    // Reviews Table
    const reviewValues = data.reviewsData.map((data) => {
      const userRef = insertedUsers.find((u) => {
        return u.username === data.username;
      });
      const productRef = insertedProducts.find((p) => {
        return p.name === data.productName;
      });
      return [
        userRef ? userRef.user_id : null,
        productRef ? productRef.product_id : null,
        data.rating,
        data.comment,
      ];
    });
    const insertReviewQuery = format(
      `INSERT INTO reviews (user_id, product_id,rating,comment) VALUES %L RETURNING *;`,
      reviewValues
    );

    const { rows: insertedReview } = await db.query(insertReviewQuery);

    console.log("Seed data inserted successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  }
};

module.exports = seed;
