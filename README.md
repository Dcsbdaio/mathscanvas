# MathsCanvas

AI-powered O-Level Maths practice app. Students write working on a canvas, AI marks it and gives feedback.

## Deploy to Vercel

1. Upload all these files to a GitHub repository
2. Connect the repository to Vercel
3. Add environment variable in Vercel settings:
   - Key: `GROQ_API_KEY`
   - Value: your Groq API key from console.groq.com
4. Deploy

## Project structure

```
mathscanvas/
├── api/
│   ├── generate.js   ← generates questions
│   └── mark.js       ← marks student working
├── public/
│   └── index.html    ← the app frontend
├── package.json
├── vercel.json
└── .gitignore
```
