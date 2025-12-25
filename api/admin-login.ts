import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/firebase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

 try {
  console.log('INPUT USERNAME:', username);
  console.log('INPUT PASSWORD:', password);

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


    if (!doc.exists) {
      return res.status(500).json({ error: 'Admin not configured' });
    }

    const admin = doc.data();

    if (admin?.username === username && admin?.password === password) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
