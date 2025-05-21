const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-domain.com']  // Update this with your frontend domain
    : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// Helper function to generate response using ElevenLabs API
async function generateResponse(text) {
  try {
    if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
      throw new Error('ElevenLabs API key or voice ID not configured');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
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

    const audioBuffer = await response.arrayBuffer();
    return Buffer.from(audioBuffer);
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

// Webhook endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received webhook request');
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        success: false
      });
    }

    // Generate audio response
    const audioBuffer = await generateResponse(message);
    
    // Send audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Webhook server is running with ElevenLabs!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('WARNING: ELEVENLABS_API_KEY environment variable is not set');
    }
    if (!process.env.ELEVENLABS_VOICE_ID) {
      console.warn('WARNING: ELEVENLABS_VOICE_ID environment variable is not set');
    }
    console.log(`Webhook server running at http://localhost:${port}`);
  });
}

// Export for serverless
module.exports = app; 