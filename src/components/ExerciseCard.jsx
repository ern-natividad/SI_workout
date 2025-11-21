import React from 'react'
import placeholder from '../assets/background.jpg'

const ExerciseCard = ({ exercise = {} }) => {
  const { gifUrl, image, name } = exercise || {}
  const src = gifUrl || image || placeholder

  const onImgError = (e) => {
    if (e?.target?.src && !e.target.src.includes('background.jpg')) {
      e.target.src = placeholder
    }
  }

  return (
    <div className="exercise-card-image">
      <img src={src} alt={name || ''} loading="lazy" onError={onImgError} />
    </div>
  )
}

export default ExerciseCard
