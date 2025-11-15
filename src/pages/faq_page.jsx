import React, { useState } from 'react';
import '../style/faq.css';


const items = [
  {
    q: 'What is Fitness Hub?',
    a: "Fitness Hub is a fitness companion platform that helps you plan, track, and optimize your workout routines and nutrition. It's designed to give you a simple, organized way to manage every part of your fitness journey.",
  },
  {
    q: 'Do I need an account to use the website?',
    a: 'Yes — you must create an account to use the platform. Creating an account lets you save your progress, access personalized recommendations, and sync your data across devices.',
  },
  {
    q: 'How does the statistics page work?',
    a: 'Our statistics page collects your workout data to show detailed progress reports — such as PR Progress, Calories Burned, and Calories Burned — all in easy-to-read charts and summaries.',
  },
  {
    q: 'Can I customize my workout routine?',
    a: 'Yes! You can modify your workout routine based on your preferences, fitness level, and available equipment. The system suggests exercises that match your goals.',
  },
  {
    q: 'Is this program suitable for beginners?',
    a: 'Yes! Fitness Hub is designed for all fitness levels — from complete beginners to advanced athletes. We offer guided routines and step-by-step instructions to help you get started easily.',
  },
]

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex((v) => (v === i ? null : i))
  return (
    <div className="faq-page">
      <main className="faq-static">

        <div className="logo-line-container">
        <span className="shorter-line"></span>
        <img src="/logoOrange.png" alt="Fitness Hub Logo" className="info-logo" />
        <span className="shorter-line"></span>
         </div>


        <div className="divider" />

        <section className="faq-card" aria-label="Frequently Asked Questions">
          <h2 className="faq-heading">FAQ</h2>
          <div className="faq-list" role="list">
            {items.map((it, idx) => {
              const expanded = openIndex === idx
              const panelId = `faq-panel-${idx}`
              return (
                <div key={idx} className={`faq-row ${expanded ? 'open' : ''}`} role="listitem">
                  <button
                    className="faq-btn"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => toggle(idx)}
                  >
                    <span className="faq-no">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="faq-text">{it.q}</span>
                    <span className="faq-icon" aria-hidden>{expanded ? '−' : '+'}</span>
                  </button>
                  <div
                    id={panelId}
                    className="faq-panel"
                    role="region"
                    aria-hidden={!expanded}
                  >
                    <p className="answer">{it.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
