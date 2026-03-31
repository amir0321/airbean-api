import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/', async (req, res) => {
    const db = req.app.get('db');
    const { username, email } = req.body;
    const userId = uuidv4();

    if (!username || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        await db.run(
            'INSERT INTO users (id, username, email) VALUES (?, ?, ?)',
            [userId, username, email]
        );
        const newUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
        res.status(201).json(newUser);
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

export default router;