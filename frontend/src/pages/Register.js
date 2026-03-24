import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend quick validation for simple feedback
    const usernameTrimmed = formData.username.trim();
    if (!/^[A-Za-z ]+$/.test(usernameTrimmed) || usernameTrimmed.length < 1) {
      setError('Username should contain only letters (spaces allowed) and at least 1 character.');
      return;
    }

    if (!formData.password || !formData.password2) {
      setError('Please provide both password and confirm password.');
      return;
    }

    if (formData.password !== formData.password2) {
      setError('Password confirmation does not match.');
      return;
    }

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData) {
        if (typeof responseData === 'object') {
          const errors = [];
          for (const k in responseData) {
            if (Array.isArray(responseData[k])) {
              errors.push(...responseData[k]);
            } else {
              errors.push(responseData[k]);
            }
          }
          setError(errors.flat().join(' '));
        } else {
          setError(String(responseData));
        }
      } else {
        setError('Registration failed. Please check your input and try again.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container auth-container">
      <h1>Register</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          className="auth-input"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="auth-input"
          type="password"
          name="password2"
          placeholder="Confirm password"
          value={formData.password2}
          onChange={handleChange}
          required
        />
        <button className="auth-button" type="submit">Register</button>
      </form>
      {error && <p className="error auth-error">{error}</p>}
      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;

