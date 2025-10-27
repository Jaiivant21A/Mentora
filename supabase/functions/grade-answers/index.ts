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

// --- THIS FUNCTION IS NOW UPDATED ---
function createGradingPrompt(questions: string[], answers: string[], difficulty: string): string {
  // We format the Q&A pairs for the AI
  const qaPairs = questions.map((q, i) => `
    Question ${i + 1}: ${q}
    User's Answer ${i + 1}: ${answers[i] || "No answer provided."}
  `).join("\n");

  // Define the summary based on difficulty
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
        { "good": "Your explanation was clear and concise.", "missing": "Next time, try to provide a code example." },
        ...
      ],
      "summary": "Excellent work on these complex topics."
    }
    
    Return *only* the JSON object. Do not include any other text, markdown, or explanation.
  `;
}
// ------------------------------------

serve(async (req) => {
  console.log("Grading function invoked.");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request.");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Attempting to parse request body...");
    // --- UPDATED: Now expects 'difficulty' ---
    const { questions, answers, difficulty } = await req.json();
    console.log("Request body parsed.");

    if (!questions || !answers || !difficulty) {
      throw new Error("Invalid request body. 'questions', 'answers', and 'difficulty' are required.");
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    console.log("Google AI client initialized.");

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    console.log("Creating grading prompt...");
    // --- UPDATED: Pass difficulty to the prompt ---
    const prompt = createGradingPrompt(questions, answers, difficulty);
    // ----------------------------------------------
    
    const chat = model.startChat({ safetySettings });
    console.log("Sending message to AI for grading...");
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    console.log("Received grading from AI.");

    let feedbackJson = response.text();
    console.log("Raw AI feedback:", feedbackJson);
    
    feedbackJson = feedbackJson.replace(/```json/g, "").replace(/```/g, "");
    
    console.log("Attempting to parse JSON...");
    // This will now parse into our { feedback: [], summary: "" } object
    const gradedResponse = JSON.parse(feedbackJson);
    console.log("JSON parsed successfully.");

    // Return the full graded response object
    return new Response(JSON.stringify(gradedResponse), {
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