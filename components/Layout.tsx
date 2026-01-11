
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative flex flex-col">
        {children}
      </div>
    </div>
  );
};
