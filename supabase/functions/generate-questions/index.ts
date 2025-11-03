import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import the Google AI SDK
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

// --- THIS FUNCTION IS NOW UPDATED ---
function createPrompt(type: string, difficulty: string): string {
  let specialization = "Computer Science"; // Default
  if (type === "dsa") {
    specialization = "Data Structures and Algorithms";
  } else if (type === "frontend") {
    specialization = "Frontend Web Development (React, JS, CSS)";
  } else if (type === "system-design") {
    specialization = "System Design and Scalability";
  }

  // Define the mix of questions based on the chosen difficulty
  let questionMix = "10 medium difficulty questions"; // Default
  switch (difficulty) {
    case 'easy':
      questionMix = "7 easy questions and 3 medium questions";
      break;
    case 'medium':
      questionMix = "5 medium questions and 5 hard questions";
      break;
    case 'hard':
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
      { "question": "Explain the trade-offs of B-trees.", "difficulty": "medium" },
      ...
    ]
  `;
}
// ------------------------------------

serve(async (req) => {
  console.log("Function invoked.");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Attempting to parse request body...");
    // --- UPDATED: Now expects 'difficulty' ---
    const { type, difficulty } = await req.json();
    console.log(`Request body parsed. Type: ${type}, Difficulty: ${difficulty}`);
    // ------------------------------------------

    if (!type || !difficulty) {
      throw new Error("Missing 'type' or 'difficulty' in request body.");
    }

    console.log("Attempting to get API key...");
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY2");
    
    if (!GOOGLE_API_KEY) {
      console.error("Error: GOOGLE_API_KEY is not set or undefined.");
      throw new Error("GOOGLE_API_KEY is not set.");
    }
    console.log("API key retrieved successfully.");

    console.log("Initializing Google AI client...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    console.log("Google AI client initialized.");

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    console.log("Creating prompt...");
    // --- UPDATED: Pass difficulty to the prompt ---
    const prompt = createPrompt(type, difficulty);
    // ----------------------------------------------
    
    const chat = model.startChat({ safetySettings });
    console.log("Sending message to AI...");
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    console.log("Received response from AI.");

    let questionsJson = response.text();
    console.log("Raw AI response:", questionsJson);
    
    questionsJson = questionsJson.replace(/```json/g, "").replace(/```/g, "");
    
    console.log("Attempting to parse JSON...");
    // This will now parse into an array of objects
    const questions = JSON.parse(questionsJson);
    console.log("JSON parsed successfully.");

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error in try-catch block:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});