/// <reference types="deno.ns" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "https://esm.sh/@google/generative-ai@0.1.3";

console.log("Function is cold-booting...");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function createPrompt(type: string, difficulty: string): string {
  let specialization = "Computer Science";
  if (type === "dsa") {
    specialization = "Data Structures and Algorithms";
  } else if (type === "frontend") {
    specialization = "Frontend Web Development (React, JS, CSS)";
  } else if (type === "system-design") {
    specialization = "System Design and Scalability";
  }

  let questionMix = "10 medium difficulty questions";
  switch (difficulty) {
    case "easy":
      questionMix = "7 easy questions and 3 medium questions";
      break;
    case "medium":
      questionMix = "5 medium questions and 5 hard questions";
      break;
    case "hard":
      questionMix = "10 hard questions";
      break;
  }

  return `
    You are an expert technical interviewer. 
    Generate 10 unique interview questions for a mid-level candidate 
    in the specialization of "${specialization}".
    The 10 questions must have the following difficulty mix: ${questionMix}.
    Return the questions as a JSON array of objects.
    Each object must have a "question" key (string) and a "difficulty" key (string: "easy", "medium", or "hard").
    Ensure the "difficulty" key accurately reflects the question's difficulty.
    Return *only* the JSON array. Do not include any other text or explanation.
    Example format:
    [
      { "question": "What is a hash map?", "difficulty": "easy" },
      { "question": "Explain the trade-offs of B-trees.", "difficulty": "medium" }
    ]
  `;
}

serve(async (req: Request) => {
  console.log("Function invoked.");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, difficulty } = await req.json();
    console.log(`Request body: Type=${type}, Difficulty=${difficulty}`);

    if (!type || !difficulty) {
      throw new Error("Missing 'type' or 'difficulty' in request body.");
    }

    // Use lowercase secret name
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

    const prompt = createPrompt(type, difficulty);
    const chat = model.startChat({ safetySettings });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    let questionsJson = response.text();
    // Remove any possible ``````json code block markers
    questionsJson = questionsJson.replace(/``````/g, "");
    console.log("Cleaned AI response:", questionsJson);

    // Parse result, error if fails
    let questions;
    try {
      questions = JSON.parse(questionsJson);
    } catch (e) {
      console.error("JSON parse error:", e);
      throw new Error("Generated questions response was not valid JSON.");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
