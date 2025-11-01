// supabase/functions/get-resources/index.ts

/// <reference lib="deno.unstable" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { google } from "npm:googleapis";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// --- ENV & API SETUP ---
const API_KEY = Deno.env.get("GOOGLE_API_KEY2");
if (!API_KEY) {
  throw new Error("Environment variable GOOGLE_API_KEY2 is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });
const youtube = google.youtube("v3");
const books = google.books("v1");

// --- CATEGORY MAP ---
const categoryMap: Record<string, string> = {
  "ds-algo": "Data Structures and Algorithms",
  "web-dev": "Frontend Web Development",
  "system-design": "System Design",
};

// --- FETCH YOUTUBE VIDEOS ---
async function fetchYouTubeVideos(query: string) {
  try {
    const res = await youtube.search.list({
  part: "snippet",
  q: query,
  type: "video",
  maxResults: 5,
  key: API_KEY as string, // explicitly typed to avoid confusion
} as any);


    const items = res.data.items || [];
    return items.map((item: any) => ({
      id: `yt-${item.id?.videoId}`,
      title: item.snippet?.title ?? "Untitled Video",
      description: item.snippet?.description ?? "No description available.",
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      platform: "YouTube",
    }));
  } catch (err) {
    console.error("Error fetching YouTube videos:", err);
    return [];
  }
}

// --- FETCH GOOGLE BOOKS ---
async function fetchGoogleBooks(query: string) {
  try {
    const res = await books.volumes.list({
      key: API_KEY,
      q: query,
      maxResults: 5,
    });

    const items = res.data.items || [];
    return items.map((item: any) => ({
      id: `gb-${item.id}`,
      title: item.volumeInfo?.title ?? "Untitled Book",
      description: item.volumeInfo?.description ?? "No description available.",
      url: item.volumeInfo?.previewLink ?? "",
      platform: "Google Books",
    }));
  } catch (err) {
    console.error("Error fetching Google Books:", err);
    return [];
  }
}

// --- CLASSIFY RESULTS USING GEMINI ---
async function classifyResultsWithGemini(results: any[]) {
  if (results.length === 0) return [];

  const itemsToClassify = results.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description?.substring(0, 200) ?? "",
  }));

  const prompt = `
You are a helpful content curator. Given a list of educational resources,
classify each item as 'beginner', 'intermediate', or 'advanced' based on its title and description.

Respond ONLY with a valid JSON array where each object has the "id" and a "level" field.
Do not include any other text.

Input: ${JSON.stringify(itemsToClassify)}
Output:
  `;

  try {
    const result: any = await geminiModel.generateContent(prompt);
    const text = await result.response.text();
    const classifications = JSON.parse(text);
    const classificationMap = new Map(
      classifications.map((item: any) => [item.id, item.level])
    );

    return results.map((item) => ({
      ...item,
      level: ((classificationMap.get(item.id) ?? "beginner") as string).toLowerCase(),
    }));
  } catch (err) {
    console.error("Error classifying with Gemini:", err);
    return results.map((item) => ({ ...item, level: "beginner" }));
  }
}

// --- SERVER HANDLER ---
serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { search, category, level } = await req.json();

    if (!API_KEY) {
      throw new Error("GOOGLE_API_KEY2 is not set.");
    }

    const categoryText = categoryMap[category as keyof typeof categoryMap] || "";
    const query = `${search} ${categoryText}`.trim();

    if (!query) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    }
    
    const [bookResults, videoResults] = await Promise.all([
      fetchGoogleBooks(query),
      fetchYouTubeVideos(query)
    ]);

    const combinedResults = [...bookResults, ...videoResults];
    if (combinedResults.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      });
    }

    const classifiedResults = await classifyResultsWithGemini(combinedResults);

    const finalResults = level === "all"
      ? classifiedResults
      : classifiedResults.filter(c => c.level === level);

    return new Response(JSON.stringify(finalResults), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    // --- THIS IS THE FIX ---
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
    // -----------------------
  }
});
