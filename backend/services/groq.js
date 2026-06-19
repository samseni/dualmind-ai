const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Call Groq AI with a message and conversation history
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Array of previous messages {role, content}
 * @returns {Promise<string>} - Groq's response
 */
async function callGroq(message, conversationHistory = []) {
  try {
    // Build messages array from conversation history
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API (using Llama 3.3 70B model)
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Extract the text from the response
    const reply = response.choices[0].message.content;
    return reply;

  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}

module.exports = { callGroq };