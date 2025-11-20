import React from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import useForm from '../components/useForm';
import { useAuth } from '../components/AuthContext';
import '../style/log-in.css'; 

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { 
    formData, 
    handleChange, 
    message, 
    setMessage, 
    isSubmitting, 
    setIsSubmitting,
    resetForm
  } = useForm({
    email: '',
    password: ''
  });

  const apiUrl = '/api/auth/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Logging in...');

    try {
      const response = await axios.post(apiUrl, formData);

      if (response.data.success) {
        setMessage(`Welcome back, ${response.data.username}!`);
        console.log('Login response:', response.data);
        // Also inform AuthContext about the login so sessionStorage + context state are set
        // `user_id` is returned by the API and matches AuthContext.login(id, token)
        if (response.data.user_id) {
          console.log('Calling login with:', response.data.user_id, response.data.weight, response.data.height);
          login(response.data.user_id, response.data.token, response.data.weight, response.data.height);
        } else {
          // Fallback: set a mock user id if API didn't return one
          login(1, response.data.token);
        }

        resetForm();
        navigate('/homepage');
      } else {
        setMessage(`Login failed. ${response.data.message}`);
      }
    } catch (error) {
      console.error('Login Error:', error);
      let errorMessage = 'An unexpected server error occurred.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Link to="/" className="back-btn">← Back</Link>
      <div className="login-box">
        <h2>Welcome Back!</h2>

        <div className={`message-box ${
          message.includes('Welcome') ? 'message-success' :
          message.includes('Error') || message.includes('failed') ? 'message-error' : ''
        }`}>
          {message || 'Enter your credentials to log in.'}
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />

          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

