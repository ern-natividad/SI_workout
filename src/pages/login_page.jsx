import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useForm from '../components/useForm';
import '../style/log-in.css'; 

function LoginPage() {
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

  const apiUrl = 'http://localhost/workout/react-api/API/login.php';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Logging in...');

    try {
      const response = await axios.post(apiUrl, formData);

      if (response.data.status === 'success') {
        setMessage(`Welcome back, ${response.data.username}!`);
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('username', response.data.username);
        resetForm(); 
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

