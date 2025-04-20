import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#E3D4D0]/10 border-t border-[#E3D4D0]/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <img 
                src="/Users/divyeshmedidi/Desktop/guardian-track-connect-39-main/guardiantrack.png" 
                alt="GuardianTrack Logo" 
                className="h-8 w-8 mr-2"
              />
              <span className="text-lg font-semibold text-[#7A8D9B]">GuardianTrack</span>
            </div>
            <p className="text-sm text-[#B2B9BF] mt-1">Keeping students safe during transit</p>
          </div>
          
          <div className="text-sm text-[#B2B9BF] flex items-center">
            <span> <strong className="font-medium">Made by not-cmd</strong></span>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-[#B2B9BF]">
            <span>&copy; {new Date().getFullYear()} GuardianTrack. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 