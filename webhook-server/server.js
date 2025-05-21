require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate AI response
async function generateAIResponse(message) {
  // This is a simple response. You can integrate with other AI services here
  const responses = [
    "I'm JARVIS, your AI assistant. I'm here to help you with any tasks or questions you might have.",
    "Hello! I'm here to assist you. What can I help you with today?",
    "Greetings! I'm JARVIS, your personal AI assistant. How may I be of service?",
    "I'm here and ready to help. What would you like to know?",
    "Hello! I'm processing your request and I'm here to assist you."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Webhook endpoint
app.post('/api/chat', async (req, res) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required'
      });
    }

    console.log('Received webhook request');
    console.log('Request body:', req.body);
    console.log('Extracted message:', message);

    // Generate AI response
    const response = await generateAIResponse(message);
    console.log('Generated response:', response);

    // Send response
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error processing request',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server running at http://localhost:${PORT}`);
  console.log('Waiting for requests...');
});

// Export for serverless
module.exports = app; 