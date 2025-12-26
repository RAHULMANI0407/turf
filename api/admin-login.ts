import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (!body) {
    body = JSON.parse(req.rawBody || '{}');
  }

  const { username, password } = body;

  console.log('REQ BODY:', body);

  try {
    const doc = await db.collection('admin').doc('admin').get();
    const admin = doc.data();

    console.log('DB DATA:', admin);

    if (admin?.username === username && admin?.password === password) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
