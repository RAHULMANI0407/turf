import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  // TEMP: hard check
  if (username === 'admin' && password === 'admin1234') {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
}
