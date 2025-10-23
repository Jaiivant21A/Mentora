import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import the Google AI SDK
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "https://esm.sh/@google/generative-ai@0.1.3";

console.log("Function is cold-booting..."); // This log appears once when it wakes up

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to create a prompt for the AI
function createPrompt(type: string): string {
  let specialization = "Computer Science"; // Default
  if (type === "dsa") {
    specialization = "Data Structures and Algorithms";
  } else if (type === "frontend") {
    specialization = "Frontend Web Development (React, JS, CSS)";
  } else if (type === "system-design") {
    specialization = "System Design and Scalability";
  }
  
  return `
    You are an expert technical interviewer. 
    Generate 10 unique interview questions for a mid-level candidate 
    in the specialization of "${specialization}".
    
    Return the questions as a JSON array of strings. 
    Do not include any other text or explanation.
    
    Example format:
    [
      "Question 1?",
      "Question 2?",
      ...
    ]
  `;
}

serve(async (req) => {
  console.log("Function invoked."); // This log appears every time

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Attempting to parse request body...");
    const { type } = await req.json();
    console.log("Request body parsed. Type:", type);

    console.log("Attempting to get API key...");
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    
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
    const prompt = createPrompt(type);
    
    const chat = model.startChat({ safetySettings });
    console.log("Sending message to AI...");
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    console.log("Received response from AI.");

    let questionsJson = response.text();
    console.log("Raw AI response:", questionsJson);
    
    questionsJson = questionsJson.replace(/```json/g, "").replace(/```/g, "");
    
    console.log("Attempting to parse JSON...");
    const questions = JSON.parse(questionsJson);
    console.log("JSON parsed successfully.");

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    // This will now log the detailed error
    console.error("Error in try-catch block:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});