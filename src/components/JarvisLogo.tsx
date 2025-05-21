
import React from 'react';

const JarvisLogo: React.FC = () => {
  return (
    <div className="jarvis-logo-container relative w-64 h-64 mx-auto">
      {/* Outer rotating circle */}
      <div className="absolute inset-0 w-full h-full rounded-full border-2 border-jarvis/30 animate-spin-slow"></div>
      
      {/* Middle circle with segments */}
      <div className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] rounded-full border border-jarvis/50">
        {/* Segments on the circle */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-4 h-1 bg-jarvis"
            style={{ 
              transform: `rotate(${i * 30}deg) translateX(calc(50% - 8px))`,
              transformOrigin: 'center',
              left: '50%',
              top: '50%',
              opacity: Math.random() > 0.5 ? 1 : 0.5
            }}
          ></div>
        ))}
      </div>
      
      {/* Inner circle with pulse */}
      <div className="absolute inset-8 w-[calc(100%-64px)] h-[calc(100%-64px)] rounded-full border-2 border-jarvis-accent flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full rounded-full bg-jarvis/5 animate-pulse-slow"></div>
        <div className="absolute inset-0 w-full h-full rounded-full border border-jarvis/20"></div>
        
        {/* Binary code rings */}
        <div className="absolute inset-0 w-full h-full rounded-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute text-[8px] text-jarvis-accent/70"
              style={{ 
                transform: `rotate(${i * 18}deg) translateY(-50%)`,
                left: '50%',
                top: '50%'
              }}
            >
              {Math.random() > 0.5 ? '1' : '0'}
            </div>
          ))}
        </div>
        
        {/* J.A.R.V.I.S text */}
        <span className="text-jarvis-accent text-xl font-bold tracking-wide z-10">
          J.A.R.V.I.S
        </span>
      </div>
      
      {/* Decorative data segments */}
      <div className="absolute inset-0 w-full h-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-jarvis-accent/30 h-1"
            style={{ 
              width: `${20 + Math.random() * 30}px`,
              transform: `rotate(${i * 90 + 45}deg)`,
              left: `${50 + (Math.random() * 20 - 10)}%`,
              top: `${50 + (Math.random() * 20 - 10)}%`,
              opacity: 0.7,
              animation: `pulse ${1 + Math.random() * 2}s infinite alternate`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default JarvisLogo;
