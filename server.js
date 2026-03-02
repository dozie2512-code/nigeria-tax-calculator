const express = require('express');
const path = require('path');
const fetch = global.fetch || require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/assistant', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not configured on server' });

  const { message, context } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const systemPrompt = `You are the GitHub Copilot Chat Assistant for the Nigeria Accounting & Tax Engine web app. Keep answers concise and actionable. Refer to UI labels where useful.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context URL: ${context?.url || ''}\nQuestion: ${message}` }
        ],
        max_tokens: 600,
        temperature: 0.2
      })
    });

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content || data?.error?.message || 'No reply from model';
    res.json({ reply });
  } catch (err) {
    console.error('assistant error', err);
    res.status(500).json({ error: 'assistant error', details: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
