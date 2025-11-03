import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Function booting up: find-advice (RAG AI Search)');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Get Request Body ---
    const { query, personaId } = await req.json();
    if (!query || !personaId) {
      throw new Error('Missing query or personaId.');
    }

    // --- 2. Initialize Clients ---
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY2');
    if (!GOOGLE_API_KEY) throw new Error('Server Error: GOOGLE_API_KEY2 not set.');
    
    // We need two separate clients
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Use the *service role key* for this function so it can securely RAG
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SERVICE_KEY) throw new Error('Server Error: SUPABASE_SERVICE_ROLE_KEY not set.');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      SERVICE_KEY
    );

    // --- 3. [RETRIEVAL] Find the relevant advice ---
    
    // 3a. Embed the user's query
    const embeddingResult = await embeddingModel.embedContent(query);
    const queryEmbedding = embeddingResult.embedding.values;

    // 3b. Call the RAG search function
    const { data: documents, error: rpcError } = await supabaseAdmin.rpc(
      'match_advice',
      { query_embedding: queryEmbedding, match_count: 1 }
    );

    if (rpcError) throw new Error(`RAG search error: ${rpcError.message}`);
    if (!documents || documents.length === 0) {
      throw new Error("Sorry, I don't have specific advice on that topic.");
    }

    // 3c. Get the pre-written answer as our context
    const context = documents[0].answer;
    const retrievedQuestion = documents[0].question;
    console.log(`RAG Context Found. Matched Q: "${retrievedQuestion}"`);

    // --- 4. [AUGMENTATION] Fetch the Mentor's Persona ---
    const { data: persona, error: personaError } = await supabaseAdmin
      .from('personas')
      .select('persona_prompt')
      .eq('id', personaId)
      .single();

    if (personaError) throw new Error(`Persona fetch error: ${personaError.message}`);
    const personaPrompt = persona.persona_prompt;

    // --- 5. [GENERATION] Build the prompt and stream the response ---
    const systemPrompt = `${personaPrompt}
    
You are answering a user's question. You MUST use the provided "EXPERT ANSWER" as the core of your response.
Your job is to rewrite this expert answer in your own personality. Do not just repeat it.
Make it conversational, friendly, and add your own unique insights, but ensure the main advice is delivered.
Use simple markdown (like **bolding**).

USER'S QUESTION:
"${query}"

EXPERT ANSWER (Your context):
"${context}"
`;
    
    const stream = await generativeModel.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
    });

    // --- 6. Stream the response back to the client ---
    const responseStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (err) {
    console.error('Function Error:', err instanceof Error ? err.message : err);
    const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
    // Return a JSON error so the client can display it
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});