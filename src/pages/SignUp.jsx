import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import useForm from '../components/useForm';
import '../style/signup.css';

function SignUp() {
  const { 
      formData, 
      handleChange, 
      message, 
      setMessage, 
      isSubmitting, 
      setIsSubmitting,
      resetForm
  } = useForm({
      username: '',
      email: '',
      password: '',

  });

  const apiUrl = 'http://localhost/workout/react-api/API/signup.php'; 

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setMessage('Signing up...');

      try {
          const response = await axios.post(apiUrl, formData);

          if (response.data.status === 'success') {
              setMessage(response.data.message + ' You can now log in!');
              resetForm();
          } else {
              setMessage(`Registration failed: ${response.data.message}`);
          }
      } catch (error) {
          console.error('Sign-up Error:', error);
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
    <div className="signup-container">
      <div className="overlay"></div>
       

  


      <Link to="/LoginPage" className="back-btn">← Back</Link>

      <div className="signup-box">
        <h2>Create Account</h2>

        <div className={`message-box ${
            message.includes('success') ? 'message-success' :
            message.includes('Error') ? 'message-error' : ''
        }`}>
          {message || 'Enter your details to register.'}
        </div>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

