import React, { useState } from 'react';
import { Menu, X, Trophy, Receipt } from 'lucide-react';

interface NavbarProps {
  onMyBookingsClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMyBookingsClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-turf-darker/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-turf-green" />
            <span className="text-xl font-bold text-white tracking-wider">TURF<span className="text-turf-green">PRO</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-300 hover:text-turf-green text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
                <button
                    onClick={onMyBookingsClick}
                    className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors"
                >
                    <Receipt className="w-4 h-4" />
                    My Bookings
                </button>
                <a 
                    href="#book"
                    onClick={(e) => handleNavClick(e, '#book')}
                    className="bg-turf-green text-turf-darker px-4 py-2 rounded-md text-sm font-bold hover:bg-turf-green_hover transition-colors shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_20px_rgba(132,204,22,0.5)]"
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
        <div className="md:hidden bg-turf-darker border-b border-slate-800 animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-gray-300 hover:text-turf-green block px-3 py-3 rounded-md text-base font-medium hover:bg-slate-800/50"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                <button
                    onClick={() => {
                        onMyBookingsClick();
                        setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-slate-700"
                >
                    <Receipt className="w-4 h-4" />
                    My Bookings
                </button>
                <a
                    href="#book"
                    onClick={(e) => handleNavClick(e, '#book')}
                    className="flex items-center justify-center bg-turf-green text-turf-darker px-4 py-3 rounded-lg text-sm font-bold"
                >
                    Book Now
                </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
