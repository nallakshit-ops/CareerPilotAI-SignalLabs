import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "../lib/ai/gemini-pool.js";

const prisma = new PrismaClient();

async function testQuiz() {
  console.log("=== Testing Quiz Generation with Active Models & Fallback ===");
  
  const prompt = `
    Generate 10 technical interview questions for a tech-software-development professional.
    Each question should be multiple choice with 4 options.
    Return the response in this JSON format only:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-pro-latest"];
  let result;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      result = await executeWithKeyRotation(async (apiKey) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });
        return await model.generateContent(prompt);
      });
      console.log(`✔ Success with model: ${modelName}!`);
      break;
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err.message);
    }
  }

  if (result) {
    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleaned);
    console.log(`🎉 Generated ${quiz.questions.length} questions successfully!`);
    console.log("Sample Question 1:", quiz.questions[0].question);
    console.log("Correct Answer:", quiz.questions[0].correctAnswer);
  }
}

testQuiz().finally(async () => {
  await prisma.$disconnect();
});
