import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useForm from '../components/useForm';
<<<<<<< HEAD
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

=======

function login_page() {
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
                // Store user session data
                localStorage.setItem('userToken', response.data.token); 
                localStorage.setItem('username', response.data.username);
                // In a real app, you would redirect the user here 
                
            } else {
                setMessage(`Login failed. ${response.data.message}`);
            }
        } catch (error) {
            console.error('Login Error:', error);
            
            let errorMessage = 'An unexpected server error occurred.';
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message; 
            }
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">Welcome Back!</h2>
                
                {/* Message Box */}
                <div className={`p-3 mb-4 rounded-lg text-center font-medium ${
                    message.includes('Welcome') ? 'bg-green-100 text-green-700' : 
                    message.includes('Error') || message.includes('failed') ? 'bg-red-100 text-red-700' : 'text-gray-600'
                }`}>
                    {message || 'Enter your email and password to continue.'}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Email */}
                    <label className="block">
                        <span className="text-gray-700">Email</span>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </label>
                    
                    {/* Password */}
                    <label className="block">
                        <span className="text-gray-700">Password</span>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </label>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition duration-200 mt-6 ${
                            isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}>
                        {isSubmitting ? 'Authenticating...' : 'Log In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Don't have an account? 
                    <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default login_page;
>>>>>>> 684e05aaf3c30168d79172643eb459a9f1dfb4ad
