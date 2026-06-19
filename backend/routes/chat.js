const express = require('express');
const router = express.Router();
const { callGroq } = require('../services/groq');
const { callMixtral } = require('../services/mixtral');

// POST /api/chat - Handle chat requests
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Call both AI services in parallel (allow partial failures)
    const results = await Promise.allSettled([
      callGroq(message, conversationHistory || []),
      callMixtral(message, conversationHistory || [])
    ]);

    // Extract responses or error messages
    const llamaReply = results[0].status === 'fulfilled'
      ? results[0].value
      : `Error: ${results[0].reason.message}`;

    const mixtralReply = results[1].status === 'fulfilled'
      ? results[1].value
      : `Error: ${results[1].reason.message}`;

    // Return both responses (or errors)
    res.json({
      claudeReply: llamaReply,      // Groq - Llama 3.3 70B (large, smart)
      chatgptReply: mixtralReply    // Groq - Llama 3.1 8B (fast, efficient)
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Failed to get AI responses',
      details: error.message
    });
  }
});

module.exports = router;