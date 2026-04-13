import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question, difficulty, topic, imageBase64 } = req.body;

  if (!question || !imageBase64) return res.status(400).json({ error: "Missing question or image" });

  try {
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imageBase64}` }
            },
            {
              type: "text",
              text: `You are marking a student's handwritten working for this O-Level Maths question (Singapore syllabus, ${difficulty} difficulty):

"${question}"

Analyse the handwritten working in the image carefully. Then respond with ONLY a raw JSON object, no markdown fences:
{
  "status": "correct" | "partial" | "incorrect" | "clarify",
  "score": 0-5,
  "verdict": "one sentence summary of the student's performance",
  "feedback": "3-6 sentences: identify exactly which step went wrong, hint at the error without revealing the answer, or ask a clarifying question if you cannot read a step clearly. Be direct and specific.",
  "mistake_type": "none" | "concept" | "careless" | "incomplete" | "method"
}

If the canvas appears blank or has no mathematical working visible, set status to "clarify" and ask the student to show their working.`
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 800
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
