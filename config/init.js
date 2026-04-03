const pool = require('./db');

const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      category    VARCHAR(100),
      sku         VARCHAR(100) UNIQUE,
      quantity    INTEGER      NOT NULL DEFAULT 0,
      price       NUMERIC(12,2) NOT NULL DEFAULT 0,
      description TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  `;

  try {
    await pool.query(createTableQuery);
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    throw err;
  }
};

module.exports = initDB;
