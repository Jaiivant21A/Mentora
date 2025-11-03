import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Function booting up: mentor-bot (v3.0 - Guided Path)');

// --- Helper: Generate a prompt for a NEW lesson ---
function getNewLessonPrompt(personaPrompt: string, query: string) {
  return `${personaPrompt}

A user wants to start a new lesson about: "${query}".

Your task is to:
1. Create a step-by-step lesson plan with 3-5 sub-topics.
2. Write a **concise, friendly, and welcoming** explanation for **ONLY the first sub-topic**.
3. **Use simple markdown** (like **bolding**) to make it easy to read in a chat.

Respond with a single, minified JSON object. Do not add any text or markdown formatting before or after the JSON.
The JSON MUST follow this exact format:

{"lessonPlan": ["Sub-topic 1", "Sub-topic 2", "Sub-topic 3"], "explanation": "Your concise, friendly, markdown-formatted explanation..."}
`;
}

// --- Helper: Generate a prompt for a CONTINUING lesson ---
function getContinuationPrompt(personaPrompt: string, subTopic: string, isFinalStep: boolean) {
  const jsonFormat = isFinalStep
    ? `{"explanation": "Detailed explanation...", "conclusion": "Short summary & congrats..."}`
    : `{"explanation": "Detailed explanation..."}`;

  const task = isFinalStep
    ? `Your task is to:
1. Write a **concise and friendly** explanation for **ONLY this sub-topic**.
2. After the explanation, write a **brief summary** of the *entire* topic and a **congratulatory message**.
3. **Use simple markdown** (like **bolding**).`
    : `Your task is to:
1. Write a **concise and friendly** explanation for **ONLY this sub-topic**.
2. **Use simple markdown** (like **bolding**).`;

  return `${personaPrompt}

The user is continuing a lesson. The next sub-topic is: "${subTopic}".

${task}

Respond with a single, minified JSON object. Do not add any text or markdown formatting before or after the JSON.
The JSON MUST follow this exact format:
${jsonFormat}
`;
}

// --- Main Function ---
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Initialize Clients ---
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY2');
    if (!GOOGLE_API_KEY) throw new Error('Server Error: GOOGLE_API_KEY2 not set.');

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Use the user's auth to create a client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // --- 2. Get Request Body ---
    const { query, topic, lessonPlan, currentStep, personaId } = await req.json();
    const isNewLesson = !lessonPlan;
    const isFinalStep = !isNewLesson && currentStep === lessonPlan.length - 1;
    
    let subTopicQuery = query;
    if (!isNewLesson) {
      subTopicQuery = lessonPlan[currentStep];
    }
    if (!subTopicQuery || !topic || !personaId) {
      throw new Error('Missing query, topic, or personaId.');
    }
    
    // --- 3. NEW: Fetch the Mentor's Persona ---
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('persona_prompt')
      .eq('id', personaId)
      .single();

    if (personaError) throw new Error(`Persona fetch error: ${personaError.message}`);
    if (!persona.persona_prompt) throw new Error(`Persona prompt for ${personaId} is empty.`);
    
    const personaPrompt = persona.persona_prompt;

    // --- 4. Build the correct prompt ---
    let prompt;
    if (isNewLesson) {
      prompt = getNewLessonPrompt(personaPrompt, query);
    } else {
      prompt = getContinuationPrompt(personaPrompt, subTopicQuery, isFinalStep);
    }
    
    // --- 5. Generate Content (No RAG, No Cache) ---
    const result = await generativeModel.generateContent(prompt);
    const llmResponseText = result.response.text();

    // --- 6. Clean the JSON response ---
    let cleanedText = llmResponseText;
    const jsonMatch = llmResponseText.match(/```(json)?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[2]) {
      cleanedText = jsonMatch[2].trim();
    } else {
      const firstBrace = llmResponseText.indexOf('{');
      const lastBrace = llmResponseText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedText = llmResponseText.substring(firstBrace, lastBrace + 1);
      }
    }

    // --- 7. Parse the CLEANED JSON response ---
    let llmJson;
    try {
      llmJson = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse LLM JSON response:", cleanedText);
      throw new Error("The AI returned an invalid response. Please try again.");
    }
    
    // --- 8. Send the final JSON object to the client ---
    let finalResponse;
    if (isNewLesson) {
      finalResponse = {
        lessonPlan: llmJson.lessonPlan,
        explanation: llmJson.explanation,
        conclusion: null,
        currentStep: 0,
      };
    } else {
      finalResponse = {
        lessonPlan: lessonPlan,
        explanation: llmJson.explanation,
        conclusion: llmJson.conclusion || null,
        currentStep: currentStep,
      };
    }

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Function Error:', err instanceof Error ? err.message : err);
    const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});