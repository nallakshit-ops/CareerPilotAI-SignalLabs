import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "../lib/ai/gemini-pool.js";

async function speedTest() {
  console.log("=== Testing Quiz Generation Speed ===");
  const start = Date.now();
  
  const prompt = `
    Generate 10 technical interview questions for a tech-software-development professional.
    Each question should be multiple choice with 4 options.
    Return JSON only:
    {"questions":[{"question":"string","options":["s1","s2","s3","s4"],"correctAnswer":"string","explanation":"string"}]}
  `;

  const models = ["gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
  let result;

  for (const modelName of models) {
    try {
      const genPromise = executeWithKeyRotation(async (apiKey) => {
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

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 6000)
      );

      result = await Promise.race([genPromise, timeoutPromise]);
      console.log(`✔ Success with ${modelName} in ${Date.now() - start}ms!`);
      break;
    } catch (err) {
      console.warn(`Model ${modelName} failed (${err.message}), trying next...`);
    }
  }

  if (result) {
    const text = result.response.text();
    const quiz = JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
    console.log(`Generated ${quiz.questions.length} questions in Total Time: ${Date.now() - start}ms`);
  }
}

speedTest();
