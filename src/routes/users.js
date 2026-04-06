import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const handleDbError = (error, res) => {
    if (error.message.includes('UNIQUE constraint failed: users.username')) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    if (error.message.includes('UNIQUE constraint failed: users.email')) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: 'A database error occurred.' });
};

router.post('/register', async (req, res) => {
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
        handleDbError(error, res);
    }
});

router.get('/', async (req, res) => {
    const db = req.app.get('db');
    try {
        const users = await db.all('SELECT * FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = req.app.get('db');

    try {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await db.run('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User account deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;
    const db = req.app.get('db');

    if (!username && !email) {
        return res.status(400).json({ error: 'At least one field required: username or email.' });
    }

    try {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const newUsername = username ?? user.username;
        const newEmail = email ?? user.email;

        await db.run(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [newUsername, newEmail, id]
        );

        const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        res.json(updatedUser);
    } catch (error) {
        handleDbError(error, res);
    }
});

export default router;
