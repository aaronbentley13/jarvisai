import React, { useState, useCallback } from 'react';
import { Clock, Activity, MessageSquare } from 'lucide-react';
import { Message } from './MessageBubble';
import ElevenLabsWidget from './ElevenLabsWidget';
import JarvisBackground from './JarvisBackground';

const JARVIS_IMAGE = 'https://wallpapers.com/images/hd/jarvis-4k-no-words-2wff7e5lqi91i9xf.jpg';

const JarvisInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      content: 'Hello, I am Jarvis. How can I assist you today?',
      isJarvis: true,
      timestamp: new Date()
    }
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isJarvisSpeaking, setIsJarvisSpeaking] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Handle new messages from ElevenLabs widget
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    if (message.isJarvis) {
      setIsJarvisSpeaking(true);
      // Set a timeout to simulate the duration of speech
      setTimeout(() => setIsJarvisSpeaking(false), 3000);
    }
  }, []);

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex flex-col h-screen">
      {/* Background */}
      <JarvisBackground />

      {/* Header */}
      <div className="glass-panel p-4 flex justify-between items-center z-10 mx-4 mt-4 border border-[#64ffda]/20">
        <div className="flex items-center space-x-4">
          <div className="jarvis-logo-container">
            <img
              src={JARVIS_IMAGE}
              alt="JARVIS"
              className="w-12 h-12 rounded-full border-2 border-[#64ffda] object-cover"
              onError={() => setImageError('Error loading Jarvis image')}
            />
            <div className="absolute inset-0 rounded-full border border-[#64ffda]/20 animate-pulse-slow"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#64ffda] font-mono">J.A.R.V.I.S</h1>
            <p className="text-sm text-[#8892b0]">Your Personal AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#64ffda]" />
            <span className="text-sm text-[#8892b0]">{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#64ffda]" />
            <span className="text-sm text-[#8892b0]">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-[#64ffda]" />
            <span className="text-sm text-[#8892b0]">{messages.length} messages</span>
          </div>
        </div>
      </div>

      {/* Main chat interface with centered microphone */}
      <div className="flex-1 relative z-10 m-4">
        <div className="glass-panel h-full border border-[#64ffda]/20 flex items-center justify-center">
          {/* Centered Jarvis Image with Microphone */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-[#64ffda] relative">
                <img
                  src={JARVIS_IMAGE}
                  alt="JARVIS"
                  className="w-full h-full object-cover scale-150 opacity-50"
                  onError={() => setImageError('Error loading Jarvis image')}
                />
                <div className="absolute inset-0 bg-[#64ffda]/5 animate-pulse"></div>
              </div>
              <div className="absolute -inset-2 rounded-full border-4 border-[#64ffda]/30 animate-pulse-ring"></div>
              <div className="absolute -inset-4 rounded-full border-2 border-[#64ffda]/20 animate-pulse-slow"></div>
              {isJarvisSpeaking && (
                <>
                  <div className="absolute -inset-6 rounded-full border-4 border-[#64ffda]/40 animate-pulse-ring" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute -inset-8 rounded-full border-2 border-[#64ffda]/30 animate-pulse-ring" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
          </div>

          {/* ElevenLabs Widget with Microphone */}
          <ElevenLabsWidget onNewMessage={handleNewMessage} />
        </div>
      </div>
    </div>
  );
};

export default JarvisInterface;
