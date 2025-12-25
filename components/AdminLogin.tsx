import { useState } from 'react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Enter username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = '/admin';
      } else {
        alert('Invalid username or password');
      }
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-6 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4 text-center text-white">
          Admin Login
        </h2>

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-slate-700 text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-lime-500 text-black py-2 rounded font-semibold"
        >
          {loading ? 'Checking…' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
