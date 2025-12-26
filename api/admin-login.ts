import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  console.log('REQ BODY:', { username, password });

  try {
    const snap = await db.collection('admin').limit(1).get();

    if (snap.empty) {
      console.error('No admin document found');
      return res.status(500).json({ error: 'Admin not configured' });
    }

    const admin = snap.docs[0].data();
    console.log('DB DATA:', admin);

    if (admin.username === username && admin.password === password) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
