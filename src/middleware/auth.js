// authMiddleware: hämtar x-user-id från header och sätter req.user
export default async function authMiddleware(req, res, next) {
  const db = req.app.get('db');
  const userId = req.header('x-user-id');

  if (!userId) {
    return res.status(401).json({ error: 'AnvändarID saknas i header' });
  }

  // Kolla att användaren finns i DB
  const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', userId);
  if (!user) {
    return res.status(404).json({ error: 'Användaren hittades inte' });
  }

  req.user = user; // spara user i request
  next();
}