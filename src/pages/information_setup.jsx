import React, { useState, useEffect } from "react";
import "../style/information_setup.css";
import { useNavigate } from "react-router-dom";
import { fetchData, excerciseOptions } from "../utils/fetchData";

const InformationSetup = () => {
  const navigate = useNavigate();

  // Step navigation
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "Male",
  });

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
        const targetData = await fetchData('https://exercisedb.p.rapidapi.com/exercises/targetList', excerciseOptions);
        setTargetList(targetData);
      } catch (error) {
        console.error('Error fetching targets:', error);
      }
    };
    fetchTargets();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      if (selectedEquipment.length === 0 && selectedTargets.length === 0) return;
      try {
        let exercises = [];
        for (const equipment of selectedEquipment) {
          const equipmentExercises = await fetchData(`https://exercisedb.p.rapidapi.com/exercises/equipment/${equipment}`, excerciseOptions);
          exercises = [...exercises, ...equipmentExercises];
        }
        for (const target of selectedTargets) {
          const targetExercises = await fetchData(`https://exercisedb.p.rapidapi.com/exercises/target/${target}`, excerciseOptions);
          exercises = [...exercises, ...targetExercises];
        }
        const uniqueExercises = exercises.filter((exercise, index, self) =>
          index === self.findIndex((e) => e.id === exercise.id)
        );
        setExerciseList(uniqueExercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };
    fetchExercises();
  }, [selectedEquipment, selectedTargets]);

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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final data:", formData);
    alert("Profile setup complete!");
    navigate("/homepage");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <div className="form-row">
              <div className="form-half">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-half">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-half">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-half">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
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

      case 3:
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

      case 4:
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
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`step ${step === num ? "active" : ""}`}
            >
              <div className="circle">{num}</div>
              <span className="label">
                {["Information", "Equipment", "Muscles", "Exercises"][num - 1]}
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
            {step < 4 && (
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