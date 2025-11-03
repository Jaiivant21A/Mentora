/// <reference types="deno.ns" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "https://esm.sh/@google/generative-ai@0.1.3";

console.log("Grading function is cold-booting...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function createGradingPrompt(questions: string[], answers: string[], difficulty: string): string {
  const qaPairs = questions.map((q, i) => `
    Question ${i + 1}: ${q}
    User's Answer ${i + 1}: ${answers[i] || "No answer provided."}
  `).join("\n");

  let summaryRequirement = `Finally, provide a single "summary" string. This should be a one-sentence acknowledgement based on the overall performance. For 'medium' or 'hard' interviews, be professional and encouraging (e.g., "Excellent work on these complex topics."). For 'easy' interviews, be more celebratory (e.g., "Great job, you've mastered the fundamentals!").`;

  return `
    You are an expert technical interviewer and mentor. 
    A candidate has provided the following answers to a ${difficulty} difficulty interview.

    Your task is to review each answer and provide constructive feedback, and then provide a final summary.

    Here are the questions and answers:
    ${qaPairs}

    Please evaluate each answer and return your response as a single JSON object.
    This object must have two keys: "feedback" and "summary".

    1. The "feedback" key must be a JSON array of objects. Each object must have two keys:
        - "good": A short sentence on what was good about the answer.
        - "missing": A short, constructive sentence on what was missing or could be improved.

    2. The "summary" key must be a single string. ${summaryRequirement}

    Example response format:
    {
      "feedback": [
        { "good": "You correctly identified the concept.", "missing": "You could have also mentioned its performance implications." },
        { "good": "Your explanation was clear and concise.", "missing": "Next time, try to provide a code example." }
      ],
      "summary": "Excellent work on these complex topics."
    }

    Return *only* the JSON object. Do not include any other text, markdown, or explanation.
  `;
}

serve(async (req: Request) => {
  console.log("Grading function invoked.");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { questions, answers, difficulty } = await req.json();
    if (!questions || !answers || !difficulty) {
      throw new Error("Invalid request body. 'questions', 'answers', and 'difficulty' are required.");
    }

    const GOOGLE_API_KEY = Deno.env.get("google_api_key2");
    if (!GOOGLE_API_KEY) {
      throw new Error("google_api_key2 environment variable not set.");
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const prompt = createGradingPrompt(questions, answers, difficulty);
    const chat = model.startChat({ safetySettings });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    let feedbackJson = response.text();
    // Strip possible markdown code blocks properly
    feedbackJson = feedbackJson.replace(/``````/g, "");

    let gradedResponse;
    try {
      gradedResponse = JSON.parse(feedbackJson);
    } catch (e) {
      throw new Error("Failed to parse grading JSON response from AI.");
    }

    return new Response(JSON.stringify(gradedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in grading function:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
