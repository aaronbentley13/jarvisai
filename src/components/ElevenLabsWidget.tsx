import React, { useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
        onUserMessage?: (event: CustomEvent) => void;
        onAIMessage?: (event: CustomEvent) => void;
        sendMessage?: (message: string) => void;
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
  const [jarvisResponse, setJarvisResponse] = useState<string>('');
  const widgetRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]')) {
      return;
    }

    // Load ElevenLabs widget script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.head.appendChild(script);

    const style = document.createElement('style');
    style.textContent = `
      /* Hide all text content */
      elevenlabs-convai *:not(svg):not(path) {
        font-size: 0 !important;
        line-height: 0 !important;
        color: transparent !important;
        text-indent: -9999px !important;
        user-select: none !important;
      }

      /* Target button specifically */
      elevenlabs-convai button,
      elevenlabs-convai [role="button"] {
        width: 48px !important;
        height: 48px !important;
        min-width: 48px !important;
        min-height: 48px !important;
        padding: 0 !important;
        margin: 0 !important;
        background: transparent !important;
        border: none !important;
        font-size: 0 !important;
        line-height: 0 !important;
        text-indent: -9999px !important;
        overflow: hidden !important;
      }

      /* Style microphone icon */
      elevenlabs-convai button svg,
      elevenlabs-convai [role="button"] svg {
        width: 32px !important;
        height: 32px !important;
        color: #64ffda !important;
        opacity: 0.8 !important;
        transition: all 0.2s ease-in-out !important;
        display: block !important;
        margin: auto !important;
      }

      /* Hover effects */
      elevenlabs-convai button:hover svg,
      elevenlabs-convai [role="button"]:hover svg {
        opacity: 1 !important;
        transform: scale(1.1) !important;
      }

      /* Additional text hiding */
      elevenlabs-convai button span,
      elevenlabs-convai [role="button"] span {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        opacity: 0 !important;
        position: absolute !important;
        pointer-events: none !important;
        clip: rect(0 0 0 0) !important;
        margin: -1px !important;
        overflow: hidden !important;
        padding: 0 !important;
        border: 0 !important;
      }
    `;
    
    document.head.appendChild(style);

    // Add MutationObserver to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Hide any text content
              if (node.textContent && node.textContent.trim() === 'Start a call') {
                node.style.display = 'none';
                node.style.fontSize = '0';
                node.style.lineHeight = '0';
                node.style.color = 'transparent';
                node.style.textIndent = '-9999px';
              }
              
              // Target button elements
              const buttons = node.querySelectorAll('button, [role="button"]');
              buttons.forEach(button => {
                if (button instanceof HTMLElement) {
                  button.style.width = '48px';
                  button.style.height = '48px';
                  button.style.padding = '0';
                  button.style.fontSize = '0';
                  button.style.lineHeight = '0';
                  button.style.textIndent = '-9999px';
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.head.removeChild(style);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4">
      {/* Response Box - Now positioned in center */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-[400px]">
        <div className="bg-black/30 backdrop-blur-md rounded-lg border border-[#64ffda]/30 p-4">
          <div className="bg-black/50 rounded-lg p-3 min-h-[60px] border border-[#64ffda]/20">
            <p className="text-[#64ffda] text-sm font-mono">
              {jarvisResponse || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Microphone Widget - Stays on the right */}
      <div className="w-[48px] h-[48px] relative">
        <elevenlabs-convai 
          ref={widgetRef}
          agent-id="agent_01jvqsk58keea9pwkmy6aw54vb"
          onUserMessage={(event: any) => {
            const messageText = event.detail?.text || event.detail?.message || event.detail;
            if (messageText) {
              onNewMessage({
                id: Date.now().toString(),
                content: messageText,
                isJarvis: false,
                timestamp: new Date()
              });
            }
          }}
          onAIMessage={(event: any) => {
            const messageText = event.detail?.text || event.detail?.message || event.detail;
            if (messageText) {
              setJarvisResponse(messageText);
              onNewMessage({
                id: Date.now().toString(),
                content: messageText,
                isJarvis: true,
                timestamp: new Date()
              });
            }
          }}
        />

        {/* Decorative ring around microphone */}
        <div className="absolute inset-0 border-2 border-[#64ffda]/30 rounded-full pointer-events-none">
          <div className="absolute inset-0 border border-[#64ffda]/10 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsWidget; 