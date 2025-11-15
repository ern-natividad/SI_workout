import React from 'react';
import '../style/contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        
        
        <div className="logo-line">
          <div className="line"></div>
          <img src='logoOrange.png' alt="Fitness Hub Logo" className="contact-logo" />
          <div className="line"></div>
        </div>

        <h2 className="contact-title">Contact Us</h2>
        <p className="contact-text">
          Have questions, suggestions, or want to get in touch? <br />
          We’d love to hear from you!
        </p>

        <div className="contact-card">
          <img src='gmailicon.png' alt="Gmail Icon" className="gmail-icon" />
          <a href=" " className="email-link">
            example@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
