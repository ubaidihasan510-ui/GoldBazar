import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold-500">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-dark-800 border border-gray-800 text-white rounded-xl py-3.5 ${icon ? 'pl-10' : 'pl-4'} pr-4 focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all outline-none placeholder-gray-600 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};