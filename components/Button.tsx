import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-turf-darker";
  
  const variants = {
    primary: "bg-turf-green text-turf-darker hover:bg-turf-green_hover focus:ring-turf-green",
    secondary: "bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500",
    outline: "border-2 border-turf-green text-turf-green hover:bg-turf-green hover:text-turf-darker focus:ring-turf-green"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;