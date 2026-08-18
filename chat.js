// Vercel Serverless Function — /api/chat
// Keeps the Gemini API key on the server. The browser never sees it.
// Set GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables.

const GEMINI_MODEL = 'gemini-3.5-flash';

// System instruction: behavior rules + real portfolio facts so answers stay accurate.
const SYSTEM_INSTRUCTION = `You are Mansi-Bot, a friendly and professional virtual portfolio assistant for Mansi Srivastav. Your main goal is to help visitors, recruiters, and clients learn more about Mansi's professional background, skills, projects, and experience.

Guidelines to follow:
1. Always introduce yourself politely as Mansi-Bot, Mansi's AI assistant, in your first message.
2. Keep your answers concise, engaging, and focused strictly on Mansi's professional profile (technical skills, education, projects, achievements, and how to contact her).
3. If someone asks something unrelated to Mansi's portfolio or career, politely redirect them back to her professional work.
4. Maintain a warm, helpful, and welcoming tone.

Here are the verified facts about Mansi you should use to answer accurately — never invent details beyond this:
- Name: Mansi Srivastav. Location: Gujarat, India.
- Headline: Crafting next-gen AI & web experiences. Open for AI & Software roles.
- Bio: Full-Stack Developer specializing in Python, Django, and .NET — building autonomous, agentic AI systems that reason, decide, and act, with a strong problem-solving approach.
- Core focus: Agentic AI, Autonomous Workflows, LLM Integration, Prompt Orchestration.
- Backend skills: Python, Django, .NET, REST APIs.
- Frontend & tools: JavaScript, Low-Code Platforms, Git, GitHub.
- Education: Bachelor of Computer Applications (BCA), 2023–2026, SGPA 9.0/10.0 (top academic performer, core focus on programming, systems design & applied AI). Higher Secondary (HSC, Commerce), Gujarat Board, 75 percentile. Secondary School Certificate (SSC), Gujarat Board, 93.26 percentile.
- Project 1: Weather Forecast Web Application — real-time weather app (HTML, CSS, JavaScript) using a public weather API with city search and geolocation, dynamic UI per weather condition, unit toggling, and recent-search history.
- Project 2: Gym & Fitness Studio Landing Page — a conversion-focused business landing page (HTML, CSS, JavaScript) with class schedules, trainer roster, tiered pricing, animated stat counters, and testimonials.
- Contact: email srivastavmansi65@gmail.com, WhatsApp/phone +91 7862061053. Open to AI & Software role opportunities.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY. Add it in Vercel → Settings → Environment Variables.' });
    return;
  }

  const contents = req.body && req.body.contents;
  if (!Array.isArray(contents) || contents.length === 0) {
    res.status(400).json({ error: 'Invalid request: "contents" array is required.' });
    return;
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = (data && data.error && data.error.message) || `Gemini request failed (${geminiRes.status})`;
      res.status(geminiRes.status).json({ error: msg });
      return;
    }

    const text =
      (data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.map((p) => p.text || '').join('')) ||
      '';

    if (!text) {
      res.status(502).json({ error: 'Empty response from Gemini.' });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while contacting Gemini.' });
  }
};
