const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Call Groq AI with Llama 3.1 8B model
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Array of previous messages {role, content}
 * @returns {Promise<string>} - Llama 3.1 8B's response
 */
async function callMixtral(message, conversationHistory = []) {
  try {
    // Build messages array from conversation history
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API (using Llama 3.1 8B - fast and free!)
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Extract the text from the response
    const reply = response.choices[0].message.content;
    return reply;

  } catch (error) {
    console.error('Error calling Llama 3.1 8B via Groq:', error);
    throw new Error(`Llama 3.1 8B error: ${error.message}`);
  }
}

module.exports = { callMixtral };