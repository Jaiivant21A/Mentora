import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Function booting up: mentor-bot (v2.3 - With Caching)');

// --- Helper: Generate a prompt for a NEW lesson ---
function getNewLessonPrompt(topic: string, query: string, context: string) {
  return `You are an expert ${topic.toUpperCase()} mentor. A user wants to learn about "${query}".
You must use the provided context to form your answer.
Your task is to:
1. Create a step-by-step lesson plan with 3-5 sub-topics.
2. Write a **concise, friendly, and welcoming** explanation for **ONLY the first sub-topic**.
3. **Use short paragraphs, bullet points, and simple markdown** (like **bolding**) to make it easy to read in a chat.
Respond with a single, minified JSON object. Do not add any text or markdown formatting before or after the JSON.
The JSON MUST follow this exact format:
{"lessonPlan": ["Sub-topic 1", "Sub-topic 2", "Sub-topic 3"], "explanation": "Your concise, friendly, markdown-formatted explanation..."}
---
CONTEXT:
${context}
---
USER QUERY:
${query}
`;
}
// --- Helper: Generate a prompt for a CONTINUING lesson ---
function getContinuationPrompt(topic: string, subTopic: string, context: string, isFinalStep: boolean) {
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
  return `You are an expert ${topic.toUpperCase()} mentor, continuing a lesson.
You must use the provided context to form your answer.
The user wants to learn the next sub-topic: "${subTopic}".
${task}
Respond with a single, minified JSON object. Do not add any text or markdown formatting before or after the JSON.
The JSON MUST follow this exact format:
${jsonFormat}
---
CONTEXT:
${context}
---
SUB-TOPIC TO EXPLAIN:
${subTopic}
`;
}
// ---------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Get Request Body ---
    const { query, topic, lessonPlan, currentStep } = await req.json();
    const isNewLesson = !lessonPlan;
    // --- THIS IS THE FIX ---
    const isFinalStep = !isNewLesson && currentStep === lessonPlan.length - 1;

    let subTopicQuery = query;
    if (!isNewLesson) {
      subTopicQuery = lessonPlan[currentStep];
    }
    if (!subTopicQuery || !topic) {
      throw new Error('Missing query/sub-topic or main topic.');
    }
    
    // --- 2. Initialize Admin Client ---
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SERVICE_KEY) throw new Error('Server Error: SUPABASE_SERVICE_ROLE_KEY not set.');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SERVICE_KEY
    );

    // --- 3. CHECK THE CACHE ---
    const cacheKey = subTopicQuery;
    
    const { data: cachedData, error: cacheReadError } = await supabaseAdmin
      .from('lesson_cache')
      .select('response')
      .eq('query', cacheKey)
      .single();

    if (cacheReadError && cacheReadError.code !== 'PGRST116') {
      throw new Error(`Cache read error: ${cacheReadError.message}`);
    }

    if (cachedData) {
      console.log(`Cache HIT for query: "${cacheKey}"`);
      return new Response(JSON.stringify(cachedData.response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Cache MISS for query: "${cacheKey}"`);

    // --- 4. Initialize Google AI Client ---
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY2');
    if (!GOOGLE_API_KEY) throw new Error('Server Error: GOOGLE_API_KEY2 not set.');
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // --- 5. Retrieve RAG Context ---
    const embeddingResult = await embeddingModel.embedContent(subTopicQuery);
    const queryEmbedding = embeddingResult.embedding.values;

    const { data: documents, error: rpcError } = await supabaseAdmin.rpc(
      'match_documents',
      { query_embedding: queryEmbedding, match_count: 5, filter_topic: topic }
    );

    if (rpcError) throw new Error(`Supabase RPC Error: ${rpcError.message}`);
    if (!documents || documents.length === 0) {
      throw new Error(`No documents found for topic: ${topic}.`);
    }

    const context = documents.map((doc: { content: string }) => doc.content).join('\n\n');

    // --- 6. Build the correct prompt ---
    let prompt;
    if (isNewLesson) {
      prompt = getNewLessonPrompt(topic, query, context);
    } else {
      // --- THIS IS THE FIX ---
      prompt = getContinuationPrompt(topic, subTopicQuery, context, isFinalStep);
    }
    
    // --- 7. Generate Content ---
    const result = await generativeModel.generateContent(prompt);
    const llmResponseText = result.response.text();

    // --- 8. Clean the JSON response ---
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

    // --- 9. Parse the CLEANED JSON response ---
    let llmJson;
    try {
      llmJson = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse LLM JSON response:", cleanedText);
      throw new Error("The AI returned an invalid response. Please try again.");
    }
    
    // --- 10. Format the Final Response ---
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
        // --- THIS IS THE FIX ---
        conclusion: llmJson.conclusion || null, 
        currentStep: currentStep,
      };
    }

    // --- 11. SAVE TO CACHE before returning ---
    const { error: cacheWriteError } = await supabaseAdmin
      .from('lesson_cache')
      .insert({ query: cacheKey, response: finalResponse });
      
    if (cacheWriteError) {
      console.error(`Cache write error: ${cacheWriteError.message}`);
    } else {
      console.log(`Cache WRITE for query: "${cacheKey}"`);
    }

    // --- 12. Return the new response ---
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