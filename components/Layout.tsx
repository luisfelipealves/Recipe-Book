
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-text-dark font-sans flex justify-center">
      <div className="w-full max-w-7xl bg-white min-h-screen shadow-sm sm:shadow-2xl relative flex flex-col sm:border-x sm:border-gray-100 mx-auto">
        {children}
      </div>
    </div>
  );
};
