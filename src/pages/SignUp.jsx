import React from 'react';
import axios from 'axios';
<<<<<<< HEAD
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

=======
import useForm from '../components/useForm';

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
        age: '',
        gender: 'Male', // Default value
        height_cm: '',
        weight_kg: '',
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
                resetForm(); // Reset form and submission status
            } else {
                setMessage(`Registration failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Sign-up Error:', error);
            
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
                <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">Create Account</h2>
                
                {/* Message Box */}
                <div className={`p-3 mb-4 rounded-lg text-center font-medium ${
                    message.includes('success') ? 'bg-green-100 text-green-700' : 
                    message.includes('Error') ? 'bg-red-100 text-red-700' : 'text-gray-600'
                }`}>
                    {message || 'Enter your details to register.'}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Username */}
                    <label className="block">
                        <span className="text-gray-700">Username</span>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                    </label>

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

                    {/* Age & Gender Row */}
                    <div className="flex space-x-4">
                        <label className="block w-1/2">
                            <span className="text-gray-700">Age</span>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </label>
                        <label className="block w-1/2">
                            <span className="text-gray-700">Gender</span>
                            <select name="gender" value={formData.gender} onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                    </div>

                    {/* Height & Weight Row */}
                    <div className="flex space-x-4">
                        <label className="block w-1/2">
                            <span className="text-gray-700">Height (cm)</span>
                            <input type="number" name="height_cm" step="0.01" value={formData.height_cm} onChange={handleChange} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </label>
                        <label className="block w-1/2">
                            <span className="text-gray-700">Weight (kg)</span>
                            <input type="number" name="weight_kg" step="0.01" value={formData.weight_kg} onChange={handleChange} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                        </label>
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition duration-200 ${
                            isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}>
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
>>>>>>> 684e05aaf3c30168d79172643eb459a9f1dfb4ad
