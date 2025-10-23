import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Import the Google AI SDK
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

// This prompt is more complex. It instructs the AI to act as a grader.
function createGradingPrompt(questions: string[], answers: string[]): string {
  // We format the Q&A pairs for the AI
  const qaPairs = questions.map((q, i) => `
    Question ${i + 1}: ${q}
    User's Answer ${i + 1}: ${answers[i] || "No answer provided."}
  `).join("\n");

  return `
    You are an expert technical interviewer and mentor. 
    A candidate has provided the following answers to a list of interview questions. 
    
    Your task is to review each answer and provide constructive feedback.
    
    Here are the questions and answers:
    ${qaPairs}
    
    Please evaluate each answer and return your feedback as a JSON array of objects.
    Each object in the array must have two keys: "good" and "missing".
    
    - "good": A short sentence on what was good about the answer.
    - "missing": A short, constructive sentence on what was missing or could be improved.
    
    Example response format:
    [
      { "good": "You correctly identified the concept.", "missing": "You could have also mentioned its performance implications." },
      { "good": "Your explanation was clear and concise.", "missing": "Next time, try to provide a code example." },
      ...
    ]
    
    Return *only* the JSON array. Do not include any other text, markdown, or explanation.
  `;
}

serve(async (req) => {
  console.log("Grading function invoked.");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Attempting to parse request body...");
    // We expect an object with 'questions' and 'answers' arrays
    const { questions, answers } = await req.json();
    console.log("Request body parsed.");

    if (!questions || !answers || questions.length !== answers.length) {
      throw new Error("Invalid request body. 'questions' and 'answers' arrays are required and must be the same length.");
    }

    console.log("Attempting to get API key...");
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    
    if (!GOOGLE_API_KEY) {
      console.error("Error: GOOGLE_API_KEY is not set or undefined.");
      throw new Error("GOOGLE_API_KEY is not set.");
    }
    console.log("API key retrieved successfully.");

    console.log("Initializing Google AI client...");
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    // Let's use the 'lite' model for speed on grading
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    console.log("Google AI client initialized.");

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    console.log("Creating grading prompt...");
    const prompt = createGradingPrompt(questions, answers);
    
    const chat = model.startChat({ safetySettings });
    console.log("Sending message to AI for grading...");
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    console.log("Received grading from AI.");

    let feedbackJson = response.text();
    console.log("Raw AI feedback:", feedbackJson);
    
    // Clean up the AI's response
    feedbackJson = feedbackJson.replace(/```json/g, "").replace(/```/g, "");
    
    console.log("Attempting to parse JSON...");
    const feedback = JSON.parse(feedbackJson);
    console.log("JSON parsed successfully.");

    // Return the array of feedback objects
    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in try-catch block:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});