import React from 'react';
import { GALLERY_IMAGES } from '../constants';

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Arena</h2>
           <div className="h-1 w-20 bg-turf-green rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_IMAGES.map((src, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-xl group ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
            >
              <img 
                src={src} 
                alt={`Turf image ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 min-h-[200px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <span className="text-white font-medium tracking-widest border border-white px-4 py-2 rounded-sm backdrop-blur-sm">VIEW</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;