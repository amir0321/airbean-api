import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'airbean.db');
const menuPath = path.join(__dirname, 'database', 'menu.json');
const dbDir = path.dirname(dbPath);

async function setupDB() {

    await fs.mkdir(dbDir, { recursive: true });

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS menu (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL
        );
    `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )
    `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        order_nr TEXT PRIMARY KEY,
        user_id TEXT,
        total_price INTEGER NOT NULL,
        eta INTEGER NOT NULL,
        order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
    `)

    await db.exec(`
    CREATE TABLE IF NOT EXISTS order_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_nr TEXT,
        product_id TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (order_nr) REFERENCES orders(order_nr),
        FOREIGN KEY (product_id) REFERENCES menu(id)
    )
    `);

    const menuCheck = await db.get('SELECT COUNT(*) as count FROM menu');

    if (menuCheck.count === 0) {
        try {
            const rawData = await fs.readFile(menuPath, 'utf-8');
            const menuData = JSON.parse(rawData);

            for (const item of menuData) {
                await db.run(
                    'INSERT INTO menu (id, title, description, price) VALUES (?, ?, ?, ?)',
                    [item.id, item.title, item.desc, item.price]
                );
            }
            console.log('Menyn har importerats till databasen!');
        } catch (error) {
            console.error('Kunde inte läsa menu.json:', error.message);
        }
    }

    return db;
}


export { setupDB };