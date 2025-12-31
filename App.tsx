import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BookingSection from './components/BookingSection';
import Pricing from './components/Pricing';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import { PRICING as DEFAULT_PRICING } from './constants';

const App: React.FC = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/get-config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.WEEKDAY && data.WEEKEND) {
          setPricing(data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch pricing", e);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  return (
    <div className="min-h-screen bg-turf-darker font-sans text-slate-100 selection:bg-turf-green selection:text-turf-darker relative">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <BookingSection pricing={pricing} />
        <Pricing pricing={pricing} />
        <Gallery />
      </main>
      <Contact onAdminClick={() => setIsAdminOpen(true)} />
      
      {isAdminOpen && (
        <AdminDashboard 
          onClose={() => setIsAdminOpen(false)} 
          currentPricing={pricing}
          onPricingUpdate={fetchPricing}
        />
      )}
    </div>
  );
};

export default App;
