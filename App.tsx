import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BookingSection from './components/BookingSection';
import Pricing from './components/Pricing';
import Gallery from './components/Gallery';
import Contact from './components/Contact';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-turf-darker font-sans text-slate-100 selection:bg-turf-green selection:text-turf-darker">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <BookingSection />
        <Pricing />
        <Gallery />
      </main>
      <Contact />
    </div>
  );
};

export default App;
