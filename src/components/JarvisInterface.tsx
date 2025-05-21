import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Send, Power, Signal, Clock, Activity, MessageSquare, Mic } from 'lucide-react';

import MessageBubble, { Message } from './MessageBubble';
import { Button } from '@/components/ui/button';
import useVoiceRecording from '@/hooks/useVoiceRecording';
import { textToSpeech } from '@/services/elevenlabs';
import { sendToWebhook } from '@/services/webhook';

// Import the image directly
import jarvisImage from '../img/jarvis1.jpg';

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
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle transcription from voice recording
  const handleTranscription = useCallback(async (text: string) => {
    console.log('Transcription received:', text);
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: text,
      isJarvis: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to webhook and get response
      const response = await sendToWebhook(text);
      if (response.success && response.audioUrl) {
        // Create and play audio
        setIsJarvisSpeaking(true);
        const audio = new Audio(response.audioUrl);
        
        // Add message once audio starts playing
        audio.onplay = () => {
          const jarvisMessage: Message = {
            id: uuidv4(),
            content: "I'm responding with voice...",
            isJarvis: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, jarvisMessage]);
        };
        
        // Clean up audio URL when done
        audio.onended = () => {
          setIsJarvisSpeaking(false);
          URL.revokeObjectURL(response.audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Error processing message');
    }
  }, []);

  const { isRecording, toggleRecording } = useVoiceRecording({
    onTranscription: handleTranscription
  });

  // Handle text input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await handleTranscription(inputText);
    setInputText('');
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#0a192f] to-black opacity-90"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#64ffda]/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#64ffda]/10 rounded-full filter blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-between p-4 relative z-10">
        {/* Messages container */}
        <div className="w-full max-w-4xl h-[calc(100vh-8rem)] flex flex-col space-y-4 overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between p-4 glass-panel">
            <div className="flex items-center space-x-4">
              <Power className="text-[#64ffda]" />
              <Signal className="text-[#64ffda]" />
              <Activity className="text-[#64ffda]" />
            </div>
            <Clock className="text-[#64ffda]" />
            <div className="text-[#64ffda]">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 glass-panel space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-4 glass-panel">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border border-[#64ffda]/20 rounded-lg p-2 text-white focus:outline-none focus:border-[#64ffda]/50"
            />
            <Button
              type="button"
              size="icon"
              onClick={toggleRecording}
              className={`
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-400' 
                  : 'bg-[#112240]/50 border border-[#64ffda]/20 text-[#64ffda] hover:bg-[#112240]/70'
                }
              `}
            >
              <Mic className={isRecording ? 'animate-pulse' : ''} />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="bg-[#112240]/50 border border-[#64ffda]/20 text-[#64ffda] hover:bg-[#112240]/70"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>

        {/* Jarvis image */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className={`
            relative w-96 h-96 rounded-full overflow-hidden
            ${isJarvisSpeaking ? 'animate-pulse-slow' : ''}
            transition-opacity duration-300
            shadow-lg shadow-[#64ffda]/20
            border-4 border-[#64ffda]/30
            bg-[#64ffda]/20
          `}>
            {/* Glow effect */}
            <div className={`
              absolute inset-0 bg-[#64ffda]/20 
              ${isJarvisSpeaking ? 'animate-glow' : ''}
            `}></div>
            
            {/* Image */}
            <img 
              src={jarvisImage}
              alt="JARVIS Interface" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('Image load error:', e);
                setImageError(`Failed to load image from ${target.src}`);
                target.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully');
                setImageError(null);
              }}
            />

            {/* Circular border */}
            <div className={`
              absolute inset-0 rounded-full 
              border-4 border-[#64ffda]/30
              ${isJarvisSpeaking ? 'animate-spin-slow' : ''}
            `}></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JarvisInterface;
