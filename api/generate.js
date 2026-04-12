import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic, difficulty } = req.body;

  if (!topic || !difficulty) return res.status(400).json({ error: "Missing topic or difficulty" });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Generate a single ${difficulty} difficulty O-Level Mathematics (Singapore syllabus) question on the topic: ${topic}.

Return ONLY a raw JSON object with exactly these fields, no markdown, no explanation:
{
  "question": "the full question text with all numbers and context needed",
  "marks": 2,
  "topic": "${topic}"
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const raw = completion.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
