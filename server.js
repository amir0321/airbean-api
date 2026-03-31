import express from 'express';
import { setupDB } from "./db.js";

import beansRouter from './src/routes/beans.js';

import usersRouter from './src/routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Välkommen till Airbean API!' });
})

app.use('/api/beans', beansRouter);
app.use('/api/users', usersRouter);

async function startServer() {
    try {
        const db = await setupDB();
        console.log('Databasen är redo och tabeller är skapade.');

        app.set('db', db);

        app.listen(PORT, () => {
            console.log(`Airbean API körs på http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Misslyckades med att starta servern:', error);
    }
}

startServer();