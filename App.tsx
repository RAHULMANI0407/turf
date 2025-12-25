import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BookingSection from './components/BookingSection';
import Pricing from './components/Pricing';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import AdminView from './components/AdminView';
import MyBookings from './components/MyBookings';
import AdminLogin from './components/AdminLogin';

const App: React.FC = () => {
  // Simple hash routing
  const [route, setRoute] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial route
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route === '#admin-login') {
  return <AdminLogin />;
}

if (route === '#admin') {
  return <AdminView />;
}
  
  if (route === '#my-bookings') {
    return (
        <div className="min-h-screen bg-turf-darker font-sans text-slate-100">
            <Navbar />
            <MyBookings />
        </div>
    );
  }

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
