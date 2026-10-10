import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { UserPlus, Mail, Lock, User as UserIcon, Shield } from 'lucide-react';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const roles = isAdminRole ? ['ADMIN'] : ['USER'];

    try {
      await api.post('/api/auth/register', {
        username,
        email,
        password,
        roles,
      });

      setSuccess('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr.response?.data?.message ||
        'Registration failed. Username or email might be taken.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-wrapper">
            <UserPlus size={24} />
          </div>
          <h2>Create Account</h2>
          <p>Sign up to shop the curated selection.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

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
                placeholder="Choose username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div className="form-checkbox">
            <input
              id="admin-role"
              type="checkbox"
              checked={isAdminRole}
              onChange={(e) => setIsAdminRole(e.target.checked)}
            />
            <label htmlFor="admin-role">
              <Shield size={14} className="checkbox-icon" />
              Register as Administrator
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
