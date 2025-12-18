import React from 'react';
import Button from './Button';
import { CalendarDays, PhoneCall } from 'lucide-react';
import { CONTACT_PHONE } from '../constants';

const Hero: React.FC = () => {
  const scrollToBook = () => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCall = () => {
    window.location.href = `tel:${CONTACT_PHONE}`;
  };

  return (
    <div id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071&auto=format&fit=crop" 
          alt="Football Turf Night" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-turf-darker via-turf-darker/80 to-turf-darker/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
        <span className="inline-block py-1 px-3 rounded-full bg-turf-green/20 text-turf-green text-sm font-semibold mb-6 border border-turf-green/30 animate-pulse">
          Open 24/7 • Night Play Available
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Book Your Turf. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-turf-green to-emerald-400">
            Play Without Limits.
          </span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience professional-grade turf for Football and Box Cricket. 
          Book your slot instantly and get ready for the game.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <Button onClick={scrollToBook} className="w-full sm:w-auto min-w-[160px] group">
            <CalendarDays className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Book Slot
          </Button>
          <Button variant="outline" onClick={handleCall} className="w-full sm:w-auto min-w-[160px]">
            <PhoneCall className="mr-2 h-5 w-5" />
            Call Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;