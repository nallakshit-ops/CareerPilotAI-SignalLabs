"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeWithKeyRotation } from "@/lib/gemini-pool";

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${user.industry
    } professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
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

  try {
    const models = ["gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
    let result;
    let lastError;

    for (const modelName of models) {
      try {
        const generationPromise = executeWithKeyRotation(async (apiKey) => {
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
          setTimeout(() => reject(new Error("Quiz generation timeout")), 6000)
        );

        result = await Promise.race([generationPromise, timeoutPromise]);
        break;
      } catch (error) {
        lastError = error;
        const isRetryable =
          error.status === 429 ||
          error.status === 404 ||
          error.status === 400 ||
          error.message?.includes("quota") ||
          error.message?.includes("rate limit") ||
          error.message?.includes("429") ||
          error.message?.includes("404") ||
          error.message?.includes("400") ||
          error.message?.includes("no longer available") ||
          error.message?.includes("not found") ||
          error.message?.includes("API key not valid");

        if (isRetryable) {
          console.warn(`⚠️ Model ${modelName} unavailable/rate-limited, trying next model...`);
          continue;
        }
        throw error;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models exhausted.");
    }

    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const match = cleanedText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid response format");
    const quiz = JSON.parse(match[0]);

    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      throw new Error("Invalid questions array");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz with Gemini, using domain fallback:", error);
    
    // Deterministic fallback questions so user never gets blocked
    const skillSample = user.skills?.[0] || "JavaScript";
    return [
      {
        question: `What is a core benefit of using modular architecture in modern ${user.industry || "software development"}?`,
        options: [
          "Improves maintainability, reusability, and isolation of concerns",
          "Eliminates the need for any database indexing",
          "Guarantees zero memory allocation",
          "Forces all components to share global state",
        ],
        correctAnswer: "Improves maintainability, reusability, and isolation of concerns",
        explanation: "Modular architectures divide systems into independent, reusable modules that are easier to test and maintain.",
      },
      {
        question: `In ${skillSample}, which principle is most critical for optimizing performance under high concurrency?`,
        options: [
          "Non-blocking asynchronous I/O and efficient memory caching",
          "Synchronous blocking loops on the main execution thread",
          "Duplicating database connections for every single sub-routine",
          "Disabling all error logging to save CPU cycles",
        ],
        correctAnswer: "Non-blocking asynchronous I/O and efficient memory caching",
        explanation: "Asynchronous non-blocking operations allow systems to serve high concurrent traffic without bottlenecking the thread.",
      },
      {
        question: "What is the primary difference between horizontal scaling and vertical scaling?",
        options: [
          "Horizontal scaling adds more machine nodes; vertical scaling upgrades CPU/RAM on a single node",
          "Horizontal scaling only works for SQL databases; vertical scaling only works for NoSQL",
          "Vertical scaling is always distributed across multiple cloud regions",
          "There is no difference between horizontal and vertical scaling",
        ],
        correctAnswer: "Horizontal scaling adds more machine nodes; vertical scaling upgrades CPU/RAM on a single node",
        explanation: "Horizontal scaling scales out across multiple instances, whereas vertical scaling scales up compute resources on an existing server.",
      },
      {
        question: "When designing RESTful APIs, which HTTP status code represents a resource that was successfully created?",
        options: ["201 Created", "200 OK", "204 No Content", "400 Bad Request"],
        correctAnswer: "201 Created",
        explanation: "HTTP 201 indicates that the request succeeded and a new resource was created as a result.",
      },
      {
        question: "What is the primary purpose of a database index?",
        options: [
          "Speed up query retrieval operations at the cost of additional write overhead",
          "Compress table storage to zero bytes",
          "Encrypt data at rest automatically",
          "Prevent all concurrent read locks",
        ],
        correctAnswer: "Speed up query retrieval operations at the cost of additional write overhead",
        explanation: "Indexes create efficient lookup data structures (like B-Trees) to accelerate SELECT queries.",
      },
      {
        question: "In distributed systems, what does the CAP theorem state regarding consistency, availability, and partition tolerance?",
        options: [
          "A distributed data store can simultaneously guarantee at most two out of the three properties",
          "All three properties can be guaranteed 100% of the time without compromise",
          "Only single-node databases can achieve partition tolerance",
          "Availability is impossible if data is replicated across zones",
        ],
        correctAnswer: "A distributed data store can simultaneously guarantee at most two out of the three properties",
        explanation: "The CAP theorem states that under network partitions, a distributed system must choose between consistency or availability.",
      },
      {
        question: "What is the key advantage of using continuous integration (CI) pipelines?",
        options: [
          "Automatically build, test, and catch integration regressions early in the lifecycle",
          "Eliminate the need to write unit tests",
          "Guarantee 100% bug-free deployments without monitoring",
          "Replace human code reviews entirely",
        ],
        correctAnswer: "Automatically build, test, and catch integration regressions early in the lifecycle",
        explanation: "CI automates testing and linting on every commit so defects are caught before reaching production.",
      },
      {
        question: "Which of the following best describes an idempotent API operation?",
        options: [
          "An operation that can be applied multiple times without changing the result beyond the initial application",
          "An operation that can only ever be executed once per user",
          "An operation that always returns a random response",
          "An operation that modifies all records in the database simultaneously",
        ],
        correctAnswer: "An operation that can be applied multiple times without changing the result beyond the initial application",
        explanation: "Idempotent requests (like GET, PUT, DELETE) produce the same state regardless of how many times they are called.",
      },
      {
        question: "In cloud computing, what is the principle of least privilege in IAM security?",
        options: [
          "Granting users and services only the minimum permissions necessary to perform their assigned tasks",
          "Giving all developers administrative permissions for convenience",
          "Revoking all credentials every 10 minutes",
          "Storing access keys in public repository commits",
        ],
        correctAnswer: "Granting users and services only the minimum permissions necessary to perform their assigned tasks",
        explanation: "Principle of least privilege reduces security risk by granting only the essential access required.",
      },
      {
        question: "What is the primary role of a Load Balancer in modern web infrastructure?",
        options: [
          "Distribute incoming client traffic across multiple healthy server instances",
          "Compile frontend JavaScript bundles for browsers",
          "Act as the primary database storage engine",
          "Encrypt user passwords using hashing algorithms",
        ],
        correctAnswer: "Distribute incoming client traffic across multiple healthy server instances",
        explanation: "Load balancers distribute network traffic across server clusters to maximize throughput and ensure high availability.",
      },
    ];
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await executeWithKeyRotation(async (apiKey) => {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        return await model.generateContent(improvementPrompt);
      });

      improvementTip = tipResult.response.text().trim();
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      improvementTip = `Focus on reinforcing core fundamentals in ${user.industry || "your domain"} and review the explanations for missed concepts.`;
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
