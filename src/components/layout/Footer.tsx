import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-6 bg-white border-t border-[#E5E7EB] text-center">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-2 md:mb-0">
          <img src="/guardiantrack.png" alt="GuardianTrack Logo" className="w-6 h-6 mr-2" />
          <span className="text-[#0056B6] font-medium">GuardianTrack</span>
        </div>
        <div className="text-sm text-[#6B7280]">
          &copy; {new Date().getFullYear()} GuardianTrack. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0 text-xs text-[#6B7280]">
          Version 1.0.0
        </div>
      </div>
    </footer>
  );
};

export default Footer; 