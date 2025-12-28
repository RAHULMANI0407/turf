import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BookingSection from './components/BookingSection';
import Pricing from './components/Pricing';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import MyBookings from './components/MyBookings';

const App: React.FC = () => {
  const [route, setRoute] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ✅ ONLY user route
  if (route === '#my-bookings') {
    return (
      <div className="min-h-screen bg-turf-darker font-sans text-slate-100">
        <Navbar />
        <MyBookings />
      </div>
    );
  }

  // ✅ MAIN SITE
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
