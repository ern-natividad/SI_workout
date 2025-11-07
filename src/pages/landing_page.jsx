import React from 'react'
import GlassMorph from '../components/GlassMorph'
import '../style/landingPage.css'
import { Link } from 'react-router-dom'

const landing_page = () => {
  return (
  
    <div className='container'>


      <div className='short-line'></div>
      <div className='long-line'></div>

       <h1> ACHIEVE YOUR POTENTIAL! </h1>
       <h1> ACHIEVE YOUR PEAK! </h1>

      <div className='long-line'></div>
      <div className='short-line'></div>

      <div>
      <h4>Stop wishing. Start lifting. We provide personalized 
                training plans, expert guidance,
        and the motivation you need to surpass your fitness goals.
      </h4>
      </div>

       <Link to='/LoginPage'><button>Get Started</button> </Link>





    </div>

  )
}

export default landing_page
