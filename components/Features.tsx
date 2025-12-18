import React from 'react';
import { AMENITIES } from '../constants';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-turf-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Us?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We provide the best sporting experience with premium amenities designed for professional and casual players alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AMENITIES.map((item, index) => (
            <div 
              key={index} 
              className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-turf-green/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(132,204,22,0.1)] group"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-turf-green/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;