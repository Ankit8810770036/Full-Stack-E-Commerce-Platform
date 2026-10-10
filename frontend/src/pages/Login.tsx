import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import { LogIn, Lock, User as UserIcon, ShieldAlert, KeyRound } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, email, roles } = response.data;
      login(token, response.data.username, email, roles);
      showToast(`Welcome back, ${response.data.username}!`, 'success');
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr.response?.data?.message ||
        'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (userVal: string, passVal: string, roleName: string) => {
    setUsername(userVal);
    setPassword(passVal);
    setError(null);
    showToast(`Filled ${roleName} credentials. Click "Sign In"!`, 'info');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-wrapper">
            <LogIn size={24} />
          </div>
          <h2>Welcome to Cartify</h2>
          <p>Sign in to manage orders, wishlists, and checkout.</p>
        </div>

        {/* 1-Click Demo Credentials Box */}
        <div className="demo-credentials-box">
          <div className="demo-credentials-header">
            <KeyRound size={14} className="key-icon" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="demo-credentials-buttons">
            <button
              type="button"
              className="btn-demo-badge admin"
              onClick={() => handleFillDemo('admin', 'admin123', 'Administrator')}
            >
              <ShieldAlert size={12} />
              <span>Admin (admin / admin123)</span>
            </button>
            <button
              type="button"
              className="btn-demo-badge shopper"
              onClick={() => handleFillDemo('alex_shopper', 'password123', 'Shopper')}
            >
              <UserIcon size={12} />
              <span>Shopper (alex_shopper / password123)</span>
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-icon-wrapper">
              <UserIcon className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to Cartify? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
