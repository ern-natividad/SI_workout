import { useState } from 'react';

/**
 * Custom hook for managing form state and input changes.
 * @param {object} initialState - The initial values for the form fields.
 * @returns {object} - Contains formData, state setters, and a handleChange function.
 */
function useForm(initialState) {
    const [formData, setFormData] = useState(initialState);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const resetForm = () => {
        setFormData(initialState);
        setMessage('');
        setIsSubmitting(false);
    };

    return {
        formData,
        setFormData,
        handleChange,
        message, 
        setMessage,
        isSubmitting, 
        setIsSubmitting,
        resetForm
    };
}

export default useForm;