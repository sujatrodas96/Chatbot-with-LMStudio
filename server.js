const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const response = await axios.post('http://localhost:1234/v1/chat/completions', {
      model: 'qwen/qwen3-1.7b',
      messages: [
        { role: 'system', content: 'Respond concisely and directly. Do not include reasoning or <think> blocks.' },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: -1,
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    let reply = response.data.choices[0].message.content;

    // Remove <think>...</think> block if present
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    res.json({ reply });
  } catch (err) {
    console.error("LLM Error:", err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(PORT, () => {
  console.log(`💬 LM Chatbot running at http://localhost:${PORT}`);
});
