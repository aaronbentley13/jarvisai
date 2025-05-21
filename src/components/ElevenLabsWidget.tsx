import React, { useEffect } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
        onUserMessage?: (event: CustomEvent) => void;
        onAIMessage?: (event: CustomEvent) => void;
      };
    }
  }
}

interface Message {
  id: string;
  content: string;
  isJarvis: boolean;
  timestamp: Date;
}

interface ElevenLabsWidgetProps {
  onNewMessage: (message: Message) => void;
}

const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({ onNewMessage }) => {
  useEffect(() => {
    // Load the ElevenLabs script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Custom event handlers
    const handleUserMessage = (event: any) => {
      console.log('User message event received:', event);
      const messageText = event.detail?.text || event.detail?.message || event.detail;
      if (messageText) {
        console.log('Processing user message:', messageText);
        onNewMessage({
          id: Date.now().toString(),
          content: messageText,
          isJarvis: false,
          timestamp: new Date()
        });
      }
    };

    const handleAIMessage = (event: any) => {
      console.log('AI message event received:', event);
      const messageText = event.detail?.text || event.detail?.message || event.detail;
      if (messageText) {
        console.log('Processing AI message:', messageText);
        onNewMessage({
          id: Date.now().toString(),
          content: messageText,
          isJarvis: true,
          timestamp: new Date()
        });
      }
    };

    // Add event listeners for both standard and custom events
    window.addEventListener('user-message', handleUserMessage);
    window.addEventListener('ai-message', handleAIMessage);
    window.addEventListener('convai-user-message', handleUserMessage);
    window.addEventListener('convai-ai-message', handleAIMessage);
    window.addEventListener('message', (event) => {
      console.log('Window message event:', event);
      if (event.data?.type === 'user-message' || event.data?.type === 'convai-user-message') {
        handleUserMessage(event.data);
      } else if (event.data?.type === 'ai-message' || event.data?.type === 'convai-ai-message') {
        handleAIMessage(event.data);
      }
    });

    return () => {
      // Cleanup
      document.body.removeChild(script);
      window.removeEventListener('user-message', handleUserMessage);
      window.removeEventListener('ai-message', handleAIMessage);
      window.removeEventListener('convai-user-message', handleUserMessage);
      window.removeEventListener('convai-ai-message', handleAIMessage);
    };
  }, [onNewMessage]);

  const handleWidgetMessage = (event: any) => {
    console.log('Widget direct message event:', event);
    const messageText = event.detail?.text || event.detail?.message;
    if (messageText) {
      console.log('Processing widget message:', messageText);
      onNewMessage({
        id: Date.now().toString(),
        content: messageText,
        isJarvis: event.type.includes('ai'),
        timestamp: new Date()
      });
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <elevenlabs-convai 
        agent-id="agent_01jvqsk58keea9pwkmy6aw54vb"
        className="w-full h-full"
        onUserMessage={handleWidgetMessage}
        onAIMessage={handleWidgetMessage}
      />
    </div>
  );
};

export default ElevenLabsWidget; 