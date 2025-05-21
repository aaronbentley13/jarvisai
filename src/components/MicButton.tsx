import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const MicButton: React.FC<MicButtonProps> = ({ isRecording, onClick, disabled }) => {
  return (
    <div className="relative">
      {/* Pulse ring animation when recording */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-[#64ffda]/30"></div>
      )}
      
      <Button
        type="button"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10
          ${isRecording 
            ? 'bg-[#64ffda] text-[#112240] hover:bg-[#64ffda]/80' 
            : 'bg-[#112240]/50 border border-[#64ffda]/20 text-[#64ffda] hover:bg-[#112240]/70'
          }
          backdrop-blur-sm
          transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Mic size={18} className={isRecording ? 'animate-pulse' : ''} />
      </Button>
    </div>
  );
};

export default MicButton;
