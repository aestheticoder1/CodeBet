import React from 'react'
import Hero from '../components/Hero'
import FeatureSection from '../components/FeatureSection'
import Testimonials from '../components/Testimonials'
import Quotes from '../components/Quotes'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div>
        <Hero/>
        <FeatureSection/>
        <Quotes/>
        <Testimonials/>
    </div>
  )
}

export default LandingPage