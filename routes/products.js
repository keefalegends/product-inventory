const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

// GET / - List all products
router.get('/', async (req, res) => {
  try {
    const search   = req.query.search || '';
    const category = req.query.category || '';
    let query  = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR sku ILIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';

    const result     = await pool.query(query, params);
    const categories = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    const stats      = await pool.query(`
      SELECT
        COUNT(*)                         AS total_products,
        SUM(quantity)                    AS total_stock,
        SUM(quantity * price)            AS total_value,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) AS out_of_stock
      FROM products
    `);

    res.render('index', {
      products:   result.rows,
      categories: categories.rows,
      stats:      stats.rows[0],
      search,
      category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: err.message });
  }
});

// GET /new - New product form
router.get('/new', (req, res) => {
  res.render('form', { product: null, action: '/products', method: 'POST' });
});

// POST / - Create product
router.post('/', async (req, res) => {
  const { name, category, sku, quantity, price, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (name, category, sku, quantity, price, description) VALUES ($1,$2,$3,$4,$5,$6)',
      [name, category, sku || null, parseInt(quantity), parseFloat(price), description]
    );
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.render('form', { product: req.body, action: '/products', method: 'POST', error: err.message });
  }
});

// GET /:id/edit - Edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.redirect('/products');
    res.render('form', { product: result.rows[0], action: `/products/${req.params.id}?_method=PUT`, method: 'POST' });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// PUT /:id - Update product
router.put('/:id', async (req, res) => {
  const { name, category, sku, quantity, price, description } = req.body;
  try {
    await pool.query(
      'UPDATE products SET name=$1, category=$2, sku=$3, quantity=$4, price=$5, description=$6 WHERE id=$7',
      [name, category, sku || null, parseInt(quantity), parseFloat(price), description, req.params.id]
    );
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.render('form', { product: { ...req.body, id: req.params.id }, action: `/products/${req.params.id}?_method=PUT`, method: 'POST', error: err.message });
  }
});

// DELETE /:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.redirect('/products');
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

module.exports = router;
