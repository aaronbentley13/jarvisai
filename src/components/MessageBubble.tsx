import React from 'react';

export interface Message {
  id: string;
  content: string;
  isJarvis: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { content, isJarvis, timestamp } = message;

  return (
    <div className={`flex ${isJarvis ? 'justify-start' : 'justify-end'} items-start animate-fade-in`}>
      <div
        className={`
          relative max-w-[80%] px-6 py-4 rounded-lg
          ${isJarvis 
            ? 'bg-[#112240]/80 border border-[#64ffda]/20 text-[#64ffda]' 
            : 'bg-[#64ffda]/10 border border-[#64ffda]/30 text-[#8892b0]'
          }
          backdrop-blur-sm
        `}
      >
        {/* Small corner accents for JARVIS messages */}
        {isJarvis && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#64ffda] -translate-x-[1px] -translate-y-[1px]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#64ffda] translate-x-[1px] -translate-y-[1px]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#64ffda] -translate-x-[1px] translate-y-[1px]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#64ffda] translate-x-[1px] translate-y-[1px]"></div>
          </>
        )}

        {/* Message content */}
        <div className="font-mono text-sm leading-relaxed">
          {content}
        </div>

        {/* Timestamp */}
        <div className={`
          text-xs mt-2 font-mono
          ${isJarvis ? 'text-[#64ffda]/60' : 'text-[#8892b0]/60'}
        `}>
          {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
