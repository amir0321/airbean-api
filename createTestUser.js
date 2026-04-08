import { setupDB } from './db.js';  // ROOT-nivå, inte src
import { v4 as uuidv4 } from 'uuid';

async function createTestUser() {
    const db = await setupDB(); 
    const userId = 'user_123';
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (existingUser) {
        console.log(`Testuser finns redan med ID: ${userId}`);
    } else {
        await db.run(
            'INSERT INTO users (id, username, email) VALUES (?, ?, ?)',
            [userId, 'Testuser', 'test@example.com']
        );
        console.log(`Testuser skapad med ID: ${userId}`);
    }

    process.exit(0);
}

createTestUser();