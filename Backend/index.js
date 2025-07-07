import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


dotenv.config();
const pool = new Pool();

console.log("Серверот ќе се обиде да се поврзе со PostgreSQL при првите queries...");

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        address TEXT,
        phone TEXT,
        acceptPromotions BOOLEAN DEFAULT FALSE,
        acceptTerms BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Табелата users е креирана или постои');
  } catch (err) {
    console.error('Грешка при креирање табела:', err);
  }
})();

app.post('/register', async (req, res) => {
  const { username, password, email, address, phone, acceptPromotions, acceptTerms } = req.body;
  try {
    await pool.query(
      `INSERT INTO users (username, password, email, address, phone, acceptPromotions, acceptTerms)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [username, password, email, address, phone, acceptPromotions, acceptTerms]
    );
    res.status(200).send({ message: "Успешна регистрација!" });
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(400).send({ message: "Username или Email веќе постои." });
    }
    console.error(err);
    res.status(500).send({ message: "Регистрацијата не успеа" });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT id, username FROM users WHERE username = $1 AND password = $2`,
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).send({ message: 'Неточен username или password' });
    }
    res.status(200).send({
      message: 'Најава успешна',
      user: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Грешка при читање од база' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, email, address, phone, acceptPromotions, acceptTerms FROM users`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Грешка при читање корисници" });
  }
});


app.listen(PORT, () => {
  console.log(`Серверот е пуштен на http://localhost:${PORT}`);
});