import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await authApi.login(formData);
      login(response.data.token, response.data.user);
      const redirect = location.state?.from || '/';
      navigate(redirect);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="container auth-page">
      <div className="panel auth-panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to EventHub</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>
          <button type="submit" className="primary-button">Login</button>
        </form>
        <p className="auth-link">
          New to EventHub? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
