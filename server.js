import express from 'express';
import { setupDB } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Airbean API is running');
})

async function startServer() {
    try {
        const db = await setupDB();
        console.log('Databasen är redo och tabeller är skapade.');

        app.set('db', db);

        app.listen(PORT, () => {
            console.log(`🚀 Airbean API körs på http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Misslyckades med att starta servern:', error);
    }
}

startServer();