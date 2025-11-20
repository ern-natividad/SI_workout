import React, { useState, useEffect } from "react";
import "../style/information_setup.css";
import { useNavigate } from "react-router-dom";
import { fetchData, excerciseOptions } from "../utils/fetchData";
import fetchWithMiddleware from "../utils/fetchMiddleware";
import { useAuth } from "../components/AuthContext";

const InformationSetup = () => {
  const navigate = useNavigate();
  const { userId: authUserId, isAuthenticated } = useAuth();

  // Step navigation (starting at 1 for equipment selection)
  const [step, setStep] = useState(1);

  // Equipment state
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  // Muscle groups state
  const [targetList, setTargetList] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);

  // Exercises state
  const [exerciseList, setExerciseList] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const equipmentData = await fetchData('https://exercisedb.p.rapidapi.com/exercises/equipmentList', excerciseOptions);
        setEquipmentList(equipmentData);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };
    fetchEquipment();
  }, []);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const targetData = await fetchData('https://exercisedb.p.rapidapi.com/exercises/bodyPartList', excerciseOptions);
        //console.log('Fetched Body Part List:', targetData);
        setTargetList(targetData);
      } catch (error) {
        console.error('Error fetching targets:', error);
      }
    };
    fetchTargets();
  }, []);

  // --- MODIFIED useEffect FOR "AND" FILTERING LOGIC WITH FALLBACK ---
  useEffect(() => {
    const fetchExercises = async () => {
      // If no filters are selected, show an empty list immediately.
      if (selectedEquipment.length === 0 && selectedTargets.length === 0) {
        return setExerciseList([]);
      }

      try {
        let exercises = [];
        let uniqueExercises = [];

        // Variable to hold the equipment-only list for fallback
        let equipmentOnlyExercises = []; 

        if (selectedEquipment.length > 0) {
          // 1. Primary Fetch: Fetch all exercises matching the selected equipment
          for (const equipment of selectedEquipment) {
            const equipmentExercises = await fetchData(`https://exercisedb.p.rapidapi.com/exercises/equipment/${equipment}`, excerciseOptions);
            exercises = [...exercises, ...equipmentExercises];
          }
          
          // Remove duplicates to get the equipment-only list
          equipmentOnlyExercises = exercises.filter((exercise, index, self) =>
            index === self.findIndex((e) => e.id === exercise.id)
          );
          
          // Start with the equipment-only list for initial filtering
          uniqueExercises = equipmentOnlyExercises; 

          // 2. Apply the secondary filter (AND logic) IF targets are also selected
          if (selectedTargets.length > 0) {
            const targetFilteredExercises = uniqueExercises.filter(exercise =>
              // Check if the exercise's bodyPart is included in the user's selectedTargets
              selectedTargets.includes(exercise.bodyPart)
            );

            // 3. FALLBACK LOGIC: If the AND filter yields no results, revert to showing equipment-only exercises.
            if (targetFilteredExercises.length === 0) {
              uniqueExercises = equipmentOnlyExercises; // Revert to equipment-only list
              console.log('No exercises found matching BOTH criteria. Falling back to Equipment-only exercises.');
            } else {
              uniqueExercises = targetFilteredExercises; // Use the successful AND filter result
            }
          }
        } else if (selectedTargets.length > 0) {
          // If ONLY targets are selected (and equipment is empty), fetch only by target.
          for (const target of selectedTargets) {
            const targetExercises = await fetchData(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${target}`, excerciseOptions);
            exercises = [...exercises, ...targetExercises];
          }
          // Remove duplicates
          uniqueExercises = exercises.filter((exercise, index, self) =>
            index === self.findIndex((e) => e.id === exercise.id)
          );
        }
        
        // 4. Update the list
        setExerciseList(uniqueExercises);
      } catch (error) {
        console.error('Error fetching and filtering exercises:', error);
      }
    };
    fetchExercises();
  }, [selectedEquipment, selectedTargets]);
  // --- END OF MODIFIED useEffect ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEquipmentToggle = (equipment) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(item => item !== equipment)
        : [...prev, equipment]
    );
  };

  const handleTargetToggle = (target) => {
    setSelectedTargets(prev =>
      prev.includes(target)
        ? prev.filter(item => item !== target)
        : [...prev, target]
    );
  };

  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(item => item !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Use AuthContext's userId (session-managed) rather than localStorage
      const userId = authUserId;

      console.debug('handleSubmit - userId:', userId, 'isAuthenticated:', isAuthenticated);
      console.debug('handleSubmit - selectedExercises:', selectedExercises);
      console.debug('handleSubmit - exerciseList length:', exerciseList.length);

      if (!userId) {
        alert('Please log in to save your workout plan');
        navigate('/loginpage'); // Redirect to login if not logged in
        return;
      }

      if (selectedExercises.length === 0) {
        alert('Please select at least one exercise before saving');
        return;
      }

      // Create a workout plan with selected exercises
      const planData = {
        user_id: parseInt(userId),
        plan_title: 'My Workout Plan',
        goal: 'Custom workout plan',
        exercises: exerciseList
          .filter(exercise => selectedExercises.includes(exercise.id))
          .map((exercise, index) => ({
            name: exercise.name,
            equipment: exercise.equipment,
            bodyPart: exercise.bodyPart,
            difficulty: exercise.difficulty || 'beginner',
            sets: 3,
            reps: 10,
            day_of_week: (index % 7) + 1,
            weight_type: 'weighted'
          }))
      };
      
      console.debug('Sending planData:', planData);
      console.log('planData exercises count:', planData.exercises.length);
      console.log('planData.user_id:', planData.user_id, 'type:', typeof planData.user_id);
      console.log('planData.plan_title:', planData.plan_title);

      // Send the data to your Node.js endpoint using the middleware (attaches auth token)
      const result = await fetchWithMiddleware('http://localhost:5000/api/workouts/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData)
      });
      
      console.debug('saveWorkoutPlan result:', result);
      
      // If middleware returns an object, check for success
       if (result && result.success) {
         alert('Workout plan saved successfully!');
         navigate("/homepage");
       } else {
         const errorMsg = (result && result.message) || 'Unknown error';
         console.error('saveWorkoutPlan failed:', errorMsg, result);
         alert('Failed to save workout plan: ' + errorMsg);
       }
    } catch (error) {
      console.error('Error saving workout plan:', error);
      alert('Failed to save workout plan. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-placeholder">
            <p>Select your <span>equipment</span> here.</p>
            <div className="equipment-grid">
              {equipmentList.map((equipment, index) => (
                <div
                  key={index}
                  className={`equipment-box ${selectedEquipment.includes(equipment) ? 'selected' : ''}`}
                  onClick={() => handleEquipmentToggle(equipment)}
                >
                  {equipment}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-placeholder">
            <p>Choose target <span>muscle groups</span>.</p>
            <div className="equipment-grid">
              {targetList.map((target, index) => (
                <div
                  key={index}
                  className={`equipment-box ${selectedTargets.includes(target) ? 'selected' : ''}`}
                  onClick={() => handleTargetToggle(target)}
                >
                  {target}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-placeholder">
            <p>Finalize your <span>exercise plan</span>.</p>
            <div className="exercise-list">
              {exerciseList.length > 0 ? (
                exerciseList.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`exercise-item ${selectedExercises.includes(exercise.id) ? 'selected' : ''}`}
                    onClick={() => handleExerciseToggle(exercise.id)}
                  >
                    <h4>{exercise.name}</h4>
                    <p>Equipment: {exercise.equipment}</p>
                    <p>Target: {exercise.target}</p>
                    <p>Body Part: {exercise.bodyPart}</p>
                  </div>
                ))
              ) : (
                <p>No exercises found. Please select equipment and muscle groups first.</p>
              )}
            </div>
            <button type="submit" className="finish-btn">Finish Setup</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="info-setup-container">
      <div className="info-card">
        {/* Progress Steps */}
        <div className="steps">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`step ${step === num ? "active" : ""}`}
            >
              <div className="circle">{num}</div>
              <span className="label">
                {["Equipment", "Muscles", "Exercises"][num - 1]}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="buttons">
            {step > 1 && (
              <button type="button" className="prev-btn" onClick={prevStep}>
                Previous
              </button>
            )}
            {step < 3 && (
              <button type="button" className="next-btn" onClick={nextStep}>
                Continue
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InformationSetup;