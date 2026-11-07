import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await authApi.signup(formData);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="container auth-page">
      <div className="panel auth-panel">
        <p className="eyebrow">Join EventHub</p>
        <h1>Create your account</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>
          <label>
            Confirm password
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </label>
          <button type="submit" className="primary-button">Sign Up</button>
        </form>
        <p className="auth-link">
          Already a member? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
