import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

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
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        if (error.message.includes('UNIQUE constraint failed: users.email')) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        if (error.message.includes('UNIQUE constraint failed: users.username')) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
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
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = req.app.get('db');

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
})
        const newUsername = username ?? user.username;
        const newEmail = email ?? user.email;

        await db.run(
            'UPDATE users SET username = ?, email = ? WHERE id = ?',
            [newUsername, newEmail, id]
        );

        const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user.' });
    }
});

export default router;