import React from 'react';
import { Check } from 'lucide-react';

interface PricingProps {
  pricing: { WEEKDAY: number; WEEKEND: number };
}

const Pricing: React.FC<PricingProps> = ({ pricing }) => {
  return (
    <section id="pricing" className="py-20 bg-turf-darker border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400">No hidden charges. Pay for what you play.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Weekday Card */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-9xl font-bold text-white">M</span>
            </div>
            <h3 className="text-xl font-semibold text-turf-green mb-2">Weekdays</h3>
            <p className="text-gray-400 mb-6">Mon - Fri</p>
            <div className="flex items-baseline mb-8">
              <span className="text-5xl font-extrabold text-white">₹{pricing.WEEKDAY}</span>
              <span className="text-gray-400 ml-2">/ hour</span>
            </div>
            <ul className="space-y-4 mb-8">
              {['Ideal for practice sessions', 'Less crowded slots', 'Standard amenities included'].map((feat, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-turf-green mr-3" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Weekend Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-turf-green/30 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(132,204,22,0.1)] transition-all">
             <div className="absolute top-0 right-0 bg-turf-green text-turf-darker text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
             </div>
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
               <span className="text-9xl font-bold text-white">S</span>
            </div>
            <h3 className="text-xl font-semibold text-turf-green mb-2">Weekends</h3>
            <p className="text-gray-400 mb-6">Sat - Sun</p>
            <div className="flex items-baseline mb-8">
              <span className="text-5xl font-extrabold text-white">₹{pricing.WEEKEND}</span>
              <span className="text-gray-400 ml-2">/ hour</span>
            </div>
            <ul className="space-y-4 mb-8">
              {['High demand slots', 'Tournament ready setup', 'Full amenities access'].map((feat, i) => (
                <li key={i} className="flex items-center text-gray-300">
                  <Check className="w-5 h-5 text-turf-green mr-3" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 text-center bg-slate-800/50 rounded-2xl p-6 max-w-2xl mx-auto border border-slate-700">
            <h4 className="text-white font-semibold mb-2">Bulk Booking or Tournaments?</h4>
            <p className="text-gray-400 text-sm">We offer special discounts for bulk hour bookings (10+ hours) and corporate tournament events.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
