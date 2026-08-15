const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const staticPath = path.join(__dirname);
app.use(express.static(staticPath));

// API Route 1: Python AI Microservice Proxy
app.post('/api/py-analyze', async (req, res) => {
  try {
    const pyResponse = await fetch('http://127.0.0.1:8000/api/py-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!pyResponse.ok) {
      return res.status(pyResponse.status).json({ error: 'Python AI Engine returned an error' });
    }

    const data = await pyResponse.json();
    res.json(data);
  } catch (err) {
    res.status(503).json({ 
      error: 'Python engine offline', 
      fallback: true, 
      message: 'Client JavaScript NLP engine active.' 
    });
  }
});

// API Route 2: Groq AI Assistant Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const apiKey = process.env.GROK_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GROK_API_KEY environment variable is missing in .env file.' 
      });
    }

    const systemPrompt = `You are the specialized AI Assistant for Rank&File, a Smart Resume Screening & Candidate Ranking Tool.
Your responsibilities:
- Provide actionable advice on resolving candidate skill gaps, missing keywords, and formatting ATS optimizations.
- Assist hiring managers in understanding candidate composite match scores (Hard skills, TF-IDF vector similarity, and ATS structure).
- Suggest tailored technical screening questions based on missing candidate technologies.
- Maintain a professional, concise, and helpful tone (2-3 paragraphs max).`;

    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content || '')
    }));
/**
 * Express backend securely proxies chat requests to
 * Groq’s API using llama-3.3-70b-versatile. We inject a 
 * custom system prompt that instructs the AI assistant to
 * act specifically as a recruitment advisor for Rank&File,
 * answering candidate questions about skill gaps and ATS optimizations."
 */
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
          { role: 'user', content: message },
        ],
        temperature: 0.6,
        max_tokens: 500
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Failed to generate response from Groq API' 
      });
    }

    res.json({ reply: data.choices?.[0]?.message?.content || "No reply generated." });

  } catch (error) {
    console.error('Server Internal Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Express v5 SPA Fallback
app.use((req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Rank&File Server running at http://localhost:${PORT}`);
  console.log(`==================================================`);
});

module.exports = app;