import React from 'react';
import useForm from './useForm'; 

const activityMultipliers = {
    sedentary: 1.2,          // Little or no exercise, desk job
    light: 1.375,            // Light exercise/sports 1-3 days/week
    moderate: 1.55,          // Moderate exercise/sports 3-5 days/week
    active: 1.725,           // Hard exercise/sports 6-7 days a week
    very_active: 1.9         // Very hard exercise/physical job or 2x day training
};

//  Mifflin-St Jeor Equation most acurate for BMR
const calculateBMR = (weight_kg, height_cm, age, gender) => {
    // Equation: 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + s
    let s = gender === 'Male' ? 5 : -161; 
    return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + s;
};


function TDEECalculator() {
   
    const { 
        formData, 
        handleChange, 
        message, 
        setMessage, 
        isSubmitting, 
    } = useForm({
        weight_kg: '',
        height_cm: '',
        age: '',
        gender: 'Male',
        activity: 'moderate'
    });

    const [results, setResults] = React.useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        const { weight_kg, height_cm, age, gender, activity } = formData;
        
        // Input validation
        if (weight_kg <= 0 || height_cm <= 0 || age <= 0) {
            setMessage('Please enter valid positive numbers for Weight, Height, and Age.');
            setResults(null);
            return;
        }

        const bmr = calculateBMR(
            parseFloat(weight_kg),
            parseFloat(height_cm),
            parseInt(age),
            gender
        );

        const tdee = bmr * activityMultipliers[activity];

        setResults({ bmr: bmr.toFixed(0), tdee: tdee.toFixed(0) });
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-teal-700 mb-6 text-center">TDEE / Calorie Calculator</h2>
                <p className="text-gray-600 mb-6 text-center">Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).</p>

                {/* Message Box */}
                {message && (
                    <div className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 font-medium text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Weight & Height Row */}
                    <div className="flex space-x-4">
                        <label className="block w-1/2">
                            <span className="text-gray-700">Weight (kg)</span>
                            <input type="number" name="weight_kg" step="0.1" value={formData.weight_kg} onChange={handleChange} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50" />
                        </label>
                        <label className="block w-1/2">
                            <span className="text-gray-700">Height (cm)</span>
                            <input type="number" name="height_cm" step="0.1" value={formData.height_cm} onChange={handleChange} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50" />
                        </label>
                    </div>

                    {/* Age & Gender Row */}
                    <div className="flex space-x-4">
                        <label className="block w-1/2">
                            <span className="text-gray-700">Age</span>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} required 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50" />
                        </label>
                        <label className="block w-1/2">
                            <span className="text-gray-700">Gender</span>
                            <select name="gender" value={formData.gender} onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </label>
                    </div>

                    {/* Activity Level */}
                    <label className="block">
                        <span className="text-gray-700">Activity Level</span>
                        <select name="activity" value={formData.activity} onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50">
                            <option value="sedentary">Sedentary (little or no exercise)</option>
                            <option value="light">Lightly Active (light exercise/sports 1-3 days/week)</option>
                            <option value="moderate">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                            <option value="active">Very Active (hard exercise/sports 6-7 days a week)</option>
                            <option value="very_active">Extremely Active (very hard exercise/physical job)</option>
                        </select>
                    </label>
                    
                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 rounded-md shadow-lg text-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Calculate Calories
                    </button>
                </form>

                {/* Results Display */}
                {results && (
                    <div className="mt-8 p-6 bg-teal-50 border-l-4 border-teal-600 rounded-lg shadow-inner">
                        <h3 className="text-2xl font-bold text-teal-800 mb-4">Your Calorie Needs</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                                <span className="font-medium text-gray-700">Basal Metabolic Rate (BMR)</span>
                                <span className="text-xl font-extrabold text-teal-600">{results.bmr}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                                <span className="font-medium text-gray-700">Total Daily Energy Expenditure (TDEE)</span>
                                <span className="text-2xl font-extrabold text-teal-800">{results.tdee} Kcal/day</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4 italic">
                            Your TDEE is the estimated number of calories you burn daily. Adjust this number to lose, maintain, or gain weight.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TDEECalculator;
