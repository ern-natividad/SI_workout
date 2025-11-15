import React from 'react'
import '../style/landingPage.css'
import { Link } from 'react-router-dom'


const LandingPage = () => {
  return (
    <div className="LandingPage">
    
      <div className="LandingPage-container">
        <div className="hero-section">
          <div className="main-logo">
         <img src="mainlogo.png" alt="main Logo" className="logo-img" />
         </div>

          <div className="short-line"></div>
          <div className="long-line"></div>

          <h1>
            ASCEND YOUR <span>POTENTIAL!</span>
          </h1>
          <h1>
            ACHIEVE YOUR <span>PEAK!</span>
          </h1>

          <div className="long-line"></div>
          <div className="short-line"></div>

          <p className="hero-text">
            Stop wishing. Start lifting. We provide personalized training plans,
            expert guidance, and the motivation you need to surpass your fitness goals.  <span>Scroll down to learn more..</span>
          </p>
        </div>
      </div>
       <p className="footer-text">Your Journey Starts Here!</p>
       <Link to="/LoginPage">
          <button className="cta-button">Get Started</button>
        </Link>

        
        
     
      <div className="information-section">

        <div className="logo-line-container">
          <div className="shorter-line"></div>
          <img src="logoOrange.png" alt="info-logo" className="info-logo" />
          <div className="shorter-line"></div>
        </div>

        <div className="longer-line"></div>

       
        <section className="info-section">
          <div className="text-box left">
            <h3>Key Features</h3>
            <h4>Workout Planner</h4>
            <p>
              Build routines tailored to your fitness level, equipment, and goals.
              Whether you’re bulking, cutting, or staying active—we’ve got you covered.
            </p>

            <h4>Statistics Dashboard</h4>
            <p>
              View detailed progress charts for strength, endurance, nutrition, and consistency.
            </p>

            <h4>Smart Optimization Tools</h4>
            <p>
              Receive data-driven suggestions to improve your workouts and nutrition.
            </p>
          </div>
          <img src="1.jpg" alt="feature" className="right-image" />
        </section>

        <div className="longer-line"></div>

      
        <section className="info-section">
          <img src="2.jpg" alt="choose" className="left-image" />
          <div className="text-box right">
            <h3>Why Choose Us?</h3>
            <ul>
              <li>Data-driven insights you can trust</li>
              <li>Beginner-friendly tools</li>
              <li>Customizable routines for all fitness levels</li>
              <li>All-in-one solution—no switching apps</li>
            </ul>
          </div>
        </section>

        <div className="longer-line"></div>

    
        <section className="info-section">
          <div className="text-box left">
            <h3>Who Is This For?</h3>
            <ul>
              <li>Beginners starting their fitness journey</li>
              <li>Experienced lifters upgrading their tracking</li>
              <li>Students balancing routines and nutrition</li>
              <li>Anyone who wants structured, guided progress</li>
            </ul>
          </div>
          <img src="3.jpg" alt="for-section" className="right-image" />
        </section>

        <div className="longer-line"></div>

        
        <section className="info-section">
          <img src="4.jpg" alt="start" className="left-image" />
          <div className="text-box right">
            <h3>Start Today!</h3>
            <p>
              Take the first step toward a smarter, more structured fitness journey.
              With personalized workouts and clear progress tracking, reaching your goals
              becomes easier and more motivating.
            </p>

            <h4>Join Now!</h4>
            <p>Your progress starts with one simple step.</p>
          </div>
        </section>

      </div>
    </div>
  )
}

export default LandingPage
