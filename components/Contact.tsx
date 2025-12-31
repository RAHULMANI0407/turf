import React from 'react';
import { Phone, MapPin, Instagram, Facebook, Shield } from 'lucide-react';
import { CONTACT_PHONE, LOCATION_MAP_URL } from '../constants';
import Button from './Button';

interface ContactProps {
  onAdminClick: () => void;
}

const Contact: React.FC<ContactProps> = ({ onAdminClick }) => {
  return (
    <footer id="contact" className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Have questions or want to organize a tournament? Reach out to us directly.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-turf-green/10 p-3 rounded-lg mr-4">
                    <MapPin className="w-6 h-6 text-turf-green" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Location</h4>
                    <p className="text-gray-400">123 Sports Complex, Near City Stadium,<br />Mumbai, Maharashtra 400001</p>
                  </div>
                </div>

                <div className="flex items-center">
                   <div className="bg-turf-green/10 p-3 rounded-lg mr-4">
                    <Phone className="w-6 h-6 text-turf-green" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Phone</h4>
                    <a href={`tel:${CONTACT_PHONE}`} className="text-gray-400 hover:text-turf-green transition-colors">+91 98765 43210</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto justify-center"
                onClick={() => window.open(`https://wa.me/${CONTACT_PHONE}`, '_blank')}
              >
                Chat on WhatsApp
              </Button>
            </div>
          </div>

          {/* Map Embed */}
          <div className="bg-slate-800 p-2 rounded-2xl h-[300px] lg:h-auto overflow-hidden">
            <iframe 
              src={LOCATION_MAP_URL}
              width="100%" 
              height="100%" 
              style={{ border: 0, borderRadius: '12px', filter: 'grayscale(1) contrast(1.2) invert(92%) hue-rotate(180deg)' }} 
              allowFullScreen={true} 
              loading="lazy"
              title="Turf Location"
            ></iframe>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TurfPro India. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <button onClick={onAdminClick} className="text-gray-700 hover:text-gray-500 transition-colors" title="Admin">
               <Shield className="w-4 h-4" />
            </button>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
