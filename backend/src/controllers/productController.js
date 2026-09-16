const os = require('os');
const { pool } = require('../config/database');

const getNodeInfo = () => ({
  hostname: os.hostname(),
  platform: os.platform(),
  uptime: os.uptime(),
});

// GET /api/products - Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json({
      success: true,
      count: rows.length,
      data: rows,
      nodeInfo: getNodeInfo(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, nodeInfo: getNodeInfo() });
  }
};

// GET /api/products/search?name=iphone
exports.searchProducts = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Query parameter "name" is required', nodeInfo: getNodeInfo() });
    }

    const [rows] = await pool.query('SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC', [`%${name}%`]);
    res.json({
      success: true,
      total: rows.length,
      query: name,
      data: rows,
      nodeInfo: getNodeInfo(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, nodeInfo: getNodeInfo() });
  }
};

// POST /api/products - Add a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required fields', nodeInfo: getNodeInfo() });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, price, description, stock, category) VALUES (?, ?, ?, ?, ?)',
      [name, parseFloat(price), description || '', parseInt(stock || 0, 10), category || 'General']
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct[0],
      nodeInfo: getNodeInfo(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, nodeInfo: getNodeInfo() });
  }
};

// GET /api/products/:id - Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found', nodeInfo: getNodeInfo() });
    }

    res.json({
      success: true,
      data: rows[0],
      nodeInfo: getNodeInfo(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, nodeInfo: getNodeInfo() });
  }
};

// PUT /api/products/:id - Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock, category } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found', nodeInfo: getNodeInfo() });
    }

    await pool.query(
      'UPDATE products SET name = ?, price = ?, description = ?, stock = ?, category = ? WHERE id = ?',
      [
        name || existing[0].name,
        price !== undefined ? parseFloat(price) : existing[0].price,
        description !== undefined ? description : existing[0].description,
        stock !== undefined ? parseInt(stock, 10) : existing[0].stock,
        category || existing[0].category,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      nodeInfo: getNodeInfo(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, nodeInfo: getNodeInfo() });
  }
};

// DELETE /api/products/:id - Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found', nodeInfo: getNodeInfo() });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      nodeInfo: getNodeInfo(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, nodeInfo: getNodeInfo() });
  }
};
