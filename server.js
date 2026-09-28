const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Change these to match your MySQL setup (or set them as environment variables)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  dateStrings: true, // return DATE columns as 'YYYY-MM-DD' text
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all expenses (newest first)
app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.expense_id, e.expense_date, c.name AS category, e.amount, e.description
       FROM expenses e
       JOIN categories c ON c.category_id = e.category_id
       ORDER BY e.expense_date DESC, e.expense_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add an expense
app.post('/api/expenses', async (req, res) => {
  const { category_id, amount, description, expense_date } = req.body;
  if (!category_id || !(Number(amount) > 0) || !expense_date) {
    return res.status(400).json({ error: 'Category, a positive amount, and a date are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO expenses (category_id, amount, description, expense_date) VALUES (?, ?, ?, ?)',
      [category_id, amount, description || '', expense_date]
    );
    res.status(201).json({ expense_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE expense_id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Total per category
app.get('/api/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.name AS category, SUM(e.amount) AS total
       FROM expenses e
       JOIN categories c ON c.category_id = e.category_id
       GROUP BY c.name
       ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Expense tracker running at http://localhost:${PORT}`));
