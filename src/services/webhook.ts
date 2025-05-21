import { toast } from 'sonner';

interface WebhookResponse {
  audioUrl: string;
  success: boolean;
}

// Webhook server URL - dynamically set based on environment
const WEBHOOK_URL = import.meta.env.PROD 
  ? `${import.meta.env.VITE_VERCEL_URL || 'https://your-vercel-deployment-url.vercel.app'}/api/chat`
  : 'http://localhost:3001/api/chat';

export const sendToWebhook = async (message: string): Promise<WebhookResponse> => {
  try {
    console.log('Sending message to webhook:', message);
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        // You can add additional context or metadata here
        timestamp: new Date().toISOString(),
        source: 'jarvis-ai'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Get audio blob from response
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return {
      audioUrl,
      success: true
    };
    
  } catch (error) {
    console.error('Error sending message to API:', error);
    toast.error('Error sending message to API');
    return {
      audioUrl: '',
      success: false
    };
  }
};
