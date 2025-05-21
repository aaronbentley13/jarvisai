import { toast } from 'sonner';

interface WebhookResponse {
  success: boolean;
  response?: string;
  error?: string;
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
        timestamp: new Date().toISOString(),
        source: 'jarvis-ai'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      response: data.response
    };
  } catch (error) {
    console.error('Error sending message to API:', error);
    toast.error('Error sending message to API');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
