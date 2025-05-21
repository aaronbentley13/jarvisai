import { toast } from 'sonner';

// Get API key and voice ID from environment variables
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

if (!API_KEY) {
  console.error('ElevenLabs API key not found. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
}

if (!VOICE_ID) {
  console.error('ElevenLabs voice ID not found. Please add VITE_ELEVENLABS_VOICE_ID to your .env file.');
}

export const textToSpeech = async (text: string): Promise<HTMLAudioElement | null> => {
  try {
    if (!API_KEY || !VOICE_ID) {
      throw new Error('ElevenLabs API key or voice ID not configured');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return audio;
    
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    toast.error('Error generating speech. Please check your ElevenLabs API key configuration.');
    return null;
  }
};

export const playAudio = (audio: HTMLAudioElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onerror = reject;
    audio.play().catch(reject);
  });
};
