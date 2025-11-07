import React from 'react'
import '../style/GlassMorph.css'

const GlassMorph = ({children, className = ''}) => {
  return (
    <div className={`glass-container ${className}`}>
      {children}
    </div>
  )
}

export default GlassMorph