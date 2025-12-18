import React, { useState } from 'react';
import { Menu, X, Trophy } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'About', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Gallery', href: '/#gallery' },
    { name: 'My Bookings', href: '#my-bookings' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's a hash link on the main page, prevent default and scroll
    if (href.startsWith('/#') && window.location.hash !== '#my-bookings' && window.location.pathname === '/') {
       e.preventDefault();
       setIsOpen(false);
       const targetId = href.replace('/#', '#');
       const element = document.querySelector(targetId);
       if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
       }
    } else {
       // Allow default behavior for navigation (e.g. going to #my-bookings or back to home)
       setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-turf-darker/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-turf-green" />
                <span className="text-xl font-bold text-white tracking-wider">TURF<span className="text-turf-green">PRO</span></span>
            </a>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-300 hover:text-turf-green px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="/#book"
                onClick={(e) => handleNavClick(e, '/#book')}
                className="bg-turf-green text-turf-darker px-4 py-2 rounded-md text-sm font-bold hover:bg-turf-green_hover transition-colors"
              >
                Book Now
              </a>
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-turf-darker border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-gray-300 hover:text-turf-green block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.name}
              </a>
            ))}
            <a
              href="/#book"
              onClick={(e) => handleNavClick(e, '/#book')}
              className="block w-full text-center bg-turf-green text-turf-darker px-4 py-3 mt-4 rounded-md text-base font-bold"
            >
              Book Now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;