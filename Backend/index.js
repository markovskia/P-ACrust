import express from 'express';
import cors from 'cors';
import {Pool} from 'pg';
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
            CREATE TABLE IF NOT EXISTS users
            (
                id
                SERIAL
                PRIMARY
                KEY,
                username
                TEXT
                NOT
                NULL
                UNIQUE,
                password
                TEXT
                NOT
                NULL,
                email
                TEXT
                NOT
                NULL
                UNIQUE,
                address
                TEXT,
                phone
                TEXT,
                acceptPromotions
                BOOLEAN
                DEFAULT
                FALSE,
                acceptTerms
                BOOLEAN
                DEFAULT
                FALSE
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reservations
            (
                id
                SERIAL
                PRIMARY
                KEY,
                table_id
                TEXT
                NOT
                NULL,
                date
                DATE
                NOT
                NULL,
                from_time
                TIME
                NOT
                NULL,
                to_time
                TIME
                NOT
                NULL,
                username
                TEXT
                NOT
                NULL,
                people_count
                INTEGER
                NOT
                NULL,
                comment
                TEXT
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders
            (
                id
                SERIAL
                PRIMARY
                KEY,
                table_name
                TEXT
                NOT
                NULL,
                order_type
                TEXT
                NOT
                NULL, -- e.g. Dine In / Take Away
                items
                JSONB
                NOT
                NULL, -- full cart (array of pizzas/items)
                subtotal
                NUMERIC
            (
                10,
                2
            ) NOT NULL,
                comment TEXT,
                status TEXT DEFAULT 'pending', -- can be pending, in_kitchen, served, paid
                created_at TIMESTAMP DEFAULT NOW
            (
            )
                );
        `);
        console.log('Табелите users, reservations и orders се креирани или постојат');
    } catch (err) {
        console.error('Грешка при креирање табела:', err);
    }
})();


app.post("/api/orders", async (req, res) => {
    const {table_name, order_type, items, subtotal, comment} = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO orders (table_name, order_type, items, subtotal, comment)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [table_name, order_type, JSON.stringify(items), subtotal, comment]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error saving order:", err);
        res.status(500).json({error: "Database error"});
    }
});

app.post('/register', async (req, res) => {
    const {username, password, email, address, phone, acceptPromotions, acceptTerms} = req.body;
    try {
        await pool.query(
            `INSERT INTO users (username, password, email, address, phone, acceptPromotions, acceptTerms)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [username, password, email, address, phone, acceptPromotions, acceptTerms]
        );
        res.status(200).send({message: "Успешна регистрација!"});
    } catch (err) {
        if (err.code === '23505') { // unique violation
            return res.status(400).send({message: "Username или Email веќе постои."});
        }
        console.error(err);
        res.status(500).send({message: "Регистрацијата не успеа"});
    }
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    try {
        const {rows} = await pool.query(
            `SELECT id, username
             FROM users
             WHERE username = $1
               AND password = $2`,
            [username, password]
        );
        if (rows.length === 0) {
            return res.status(401).send({message: 'Неточен username или password'});
        }
        res.status(200).send({
            message: 'Најава успешна',
            user: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Грешка при читање од база'});
    }
});

app.get('/users', async (req, res) => {
    try {
        const {rows} = await pool.query(
            `SELECT id, username, email, address, phone, acceptPromotions, acceptTerms
             FROM users`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send({message: "Грешка при читање корисници"});
    }
});

app.post('/api/check-table', async (req, res) => {
    const {tableId, date, fromTime, toTime} = req.body;

    try {
        const result = await pool.query(`
            SELECT *
            FROM reservations
            WHERE table_id = $1
              AND date = $2
              AND (
                (from_time
                < $4
              AND to_time
                > $3)
               OR
                (from_time >= $3
              AND from_time
                < $4)
                )
        `, [tableId, date, fromTime, toTime]);

        res.json({available: result.rows.length === 0});
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Грешка при проверка на достапност'});
    }
});

app.post('/api/reserve', async (req, res) => {
    const {tableId, date, fromTime, toTime, username, peopleCount, comment} = req.body;

    try {
        // Прво провери дали е слободна масата
        const existing = await pool.query(`
            SELECT *
            FROM reservations
            WHERE table_id = $1
              AND date = $2
              AND (
                (from_time
                < $4
              AND to_time
                > $3)
               OR
                (from_time >= $3
              AND from_time
                < $4)
                )
        `, [tableId, date, fromTime, toTime]);

        if (existing.rows.length > 0) {
            return res.status(400).send({message: 'Масата не е слободна во тој период'});
        }

        await pool.query(`
            INSERT INTO reservations (table_id, date, from_time, to_time, username, people_count, comment)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [tableId, date, fromTime, toTime, username, peopleCount, comment]);

        res.send({message: 'Резервацијата е успешно зачувана!'});
    } catch (err) {
        console.error(err);
        res.status(500).send({message: 'Грешка при зачувување на резервацијата'});
    }
});

app.listen(PORT, () => {
    console.log(`Серверот е пуштен на http://localhost:${PORT}`);
});