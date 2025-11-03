import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Function booting up: find-advice (AI-Only Generation)');

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
    
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    // We only need the generative model
    const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // We can use the standard anon key + user auth, no service key needed
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // --- 3. [REMOVED] RAG and Vector Search ---
    // We are now generating the answer from scratch.

    // --- 4. Fetch the Mentor's Persona ---
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('persona_prompt')
      .eq('id', personaId)
      .single();

    if (personaError) throw new Error(`Persona fetch error: ${personaError.message}`);
    // Clean the prompt, just in case
    const personaPrompt = persona.persona_prompt.replace(/\u00A0/g, ' ').trim();

    // --- 5. [GENERATION] Build the new prompt ---
    
    const systemPromptText = `${personaPrompt}
    
You are in "Advice Mode." The user is asking for specific, practical career or technical advice.
Your job is to answer their question directly, drawing on your expert persona.
- Be conversational, empathetic, and encouraging.
- Give clear, actionable advice.
- Use markdown (like **bolding** and bullet points) for clarity.
- This is a one-off answer, not a back-and-forth conversation. Provide a complete, helpful response.
- If you are asked a question outside your expertise, politely say that you dont't have the information currently sinze this is a RAG model which is still being updated with new data regularly. 
`;

    const systemInstructionObject = {
      role: "system",
      parts: [{ text: systemPromptText }]
    };
    
    const stream = await generativeModel.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: query }] }], // Send only the user's query
      systemInstruction: systemInstructionObject, // Send the new system instructions
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
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});