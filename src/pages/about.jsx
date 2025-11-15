import React from "react";
import '../style/About.css'

const About = () => {
  return (
    <div className="about-page">

      <div className="logo-line-container">
        <span className="shorter-line"></span>
        <img src="/logoOrange.png" alt="Fitness Hub Logo" className="info-logo" />
        <span className="shorter-line"></span>
         </div>
         
      <section className="about-section">
        <h2>Fitness Hub</h2>
        <p>
          Fitness Hub is a modern online fitness platform created by a team of
          passionate developers, fitness enthusiasts, and health advocates. We
          believe that fitness should be accessible, motivating, and
          achievable for everyone — anytime, anywhere.
        </p>
      </section>

      <section className="about-section">
        <h2>Reason Behind The Project</h2>
        <p>
          We built Fitness Hub because we saw how difficult it can be to stay
          consistent with workouts and nutrition. Many people struggle to track
          their progress or find proper guidance. Fitness Hub was created to
          make this simple and enjoyable through smart tracking, personalized
          programs, and real-time motivation.
        </p>
        <p>
          Traditional fitness tracking methods—like notebooks or scattered apps—make it
          hard to see results. Fitness Hub solves this by combining workout
          tracking, Calorie Deficit, and progress monitoring into one
          easy-to-use system. It helps users stay on track, stay motivated, and
          reach their goals faster.
        </p>
      </section>

      <section className="about-section">
        <h2>Mission</h2>
        <p>
          Our mission is to empower individuals to take control of their health
          through technology. We value discipline, progress, and community —
          because fitness isn’t just a goal, it’s a lifestyle. Our team combines
          expertise in technology, design, and wellness to deliver a platform
          that truly makes a difference.
        </p>
      </section>

      <section className="about-section">
        <h2>Conclusion</h2>
        <p>
          At Fitness Hub, we understand every fitness journey is personal. That’s
          why we built a system that grows with you — whether you’re just
          starting out or chasing your next goal. You can trust that your data
          is safe, your progress matters, and your fitness journey is our top
          priority.
        </p>
      </section>
    </div>
  );
};

export default About;
