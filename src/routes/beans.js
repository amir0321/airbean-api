import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = req.app.get('db');
        const beans = await db.all('SELECT * FROM menu');
        res.send(beans);
    } catch (error) {
        console.error('Failed to get menu:', error);
        res.status(500).send({ error: 'Failed to retrieve menu from the database.' });
    }
});

export default router;