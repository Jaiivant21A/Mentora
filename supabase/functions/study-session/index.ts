import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Function booting up: study-session (v7 - Human-Like)');

interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Get Request Body ---
    const { history, query, personaId } = await req.json();
    if (!query || !personaId || !history) {
      throw new Error('Missing query, personaId, or history.');
    }

    // --- 2. Initialize Clients ---
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY2');
    if (!GOOGLE_API_KEY) throw new Error('Server Error: GOOGLE_API_KEY2 not set.');

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); 

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // --- 3. Fetch the Mentor's Persona ---
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('persona_prompt')
      .eq('id', personaId)
      .single();

    if (personaError) throw new Error(`Persona fetch error: ${personaError.message}`);
    if (!persona.persona_prompt) throw new Error(`Persona prompt for ${personaId} is empty.`);
    
    // --- 4. Build the Prompt and History ---
    
    const historyWithoutQuery = history.slice(0, -1);

    let geminiHistory = historyWithoutQuery.map((msg: ChatMessage) => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory = geminiHistory.slice(1);
    }

    const cleanPersonaPrompt = persona.persona_prompt.replace(/\u00A0/g, ' ').trim();
    
    // --- THIS IS THE NEW, SMARTER PROMPT ---
    const systemPromptText = `${cleanPersonaPrompt}
    
You are in a one-on-one study session, acting as a Socratic mentor.
Your job is to be natural, conversational, and helpful.
Your goal is to have a back-and-forth conversation, not a lecture.

**YOUR CORE RULES:**
1.  **ACKNOWLEDGE FIRST:** Always read the user's last message. If it's a simple "yes," "okay," or "got it," acknowledge it (e.g., "Great," "Perfect," "Exactly") and then **move to the next logical point.**
2.  **ONE IDEA AT A TIME:** Introduce **one single new idea** (a definition, a property, an example) in 2-3 sentences.
3.  **END WITH A QUESTION:** After explaining your single idea, **ALWAYS** end by asking a short, engaging question to check understanding or guide them.
4.  **HANDLE "I DON'T KNOW":** If the user says "I don't know" or is stuck, **do not ask another 'why' question.** Instead, **clearly explain the answer** in a simple way, and then ask a *new* follow-up question to ensure they understood.
5.  **STAY ON TOPIC:** Do not jump back to concepts you've already covered unless the user asks. Keep the conversation moving forward.

**EXAMPLE FLOW:**
* You: "An array stores items in a line. This is called 'contiguous memory.' Make sense?"
* User: "yes"
* You: "Great. Because they're in a line, we find them using an 'index,' which is just a number for their position. The first item is usually at index 0. Any idea why we start at 0 instead of 1?"
* User: "i dont know"
* You: "No problem! It's because the index is actually an 'offset,' or the distance from the start. The first item is 0 steps from the start. We'll see why this is super-efficient for memory later. Sound good so far?"
* User: "yes"
* You: "Perfect. So, if we have an array with 3 items, what would the index of the *last* item be?"
`;
    // --- END OF PROMPT FIX ---

    // --- 5. Generate Content ---

    const systemInstructionObject = {
      role: "system",
      parts: [{ text: systemPromptText }]
    };

    const chat = generativeModel.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 1000, 
      },
      systemInstruction: systemInstructionObject,
    });

    const stream = await chat.sendMessageStream(query);

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