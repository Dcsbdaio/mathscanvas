import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic, difficulty } = req.body;

  if (!topic || !difficulty) return res.status(400).json({ error: "Missing topic or difficulty" });

  const topicHints = {
    "Algebra": "linear equations, quadratic equations, factorisation, algebraic fractions, simultaneous equations",
    "Geometry": "angles, triangles, circles, congruence, similarity, polygons, geometric proofs",
    "Trigonometry": "sin/cos/tan ratios, SOHCAHTOA, sine rule, cosine rule, bearings, angles of elevation/depression",
    "Probability": "single and combined events, tree diagrams, without replacement, conditional probability",
    "Statistics": "mean, median, mode, grouped data, histograms, cumulative frequency, box-and-whisker plots",
    "Mensuration": "area and volume of cylinder, cone, sphere, pyramid, prism, arc length, sector area",
    "Matrices": "matrix addition, matrix multiplication, 2x2 matrix operations, finding unknown elements in a matrix equation, order of a matrix",
    "Vectors": "column vectors, magnitude, vector arithmetic, position vectors, parallel vectors",
    "Graphs and Functions": "plotting and interpreting linear/quadratic/cubic/reciprocal graphs, gradient, y-intercept, graph transformations",
    "Number Theory": "primes, HCF, LCM, standard form, rational and irrational numbers, indices"
  };

  const hint = topicHints[topic] || topic;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an experienced Singapore O-Level Mathematics examiner. You generate exam-style questions that match the Singapore-Cambridge syllabus exactly. Always return valid JSON only, with no markdown formatting, no code fences, and no explanation."
        },
        {
          role: "user",
          content: `Generate a single ${difficulty} difficulty O-Level Mathematics question (Singapore syllabus) on the topic: ${topic}.

Topic scope for ${topic}: ${hint}

Difficulty guide:
- Easy: single-step, straightforward application
- Medium: two or three steps, requires some working
- Hard: multi-step, requires combining concepts

Return ONLY a raw JSON object with exactly these fields:
{
  "question": "the full question text with all numbers and context needed to solve it",
  "marks": 2,
  "topic": "${topic}"
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 600
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
