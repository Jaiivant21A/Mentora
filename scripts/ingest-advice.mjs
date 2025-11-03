import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { ADVICE_DATA } from './advice-data.js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GOOGLE_API_KEY = process.env.VITE_GOOGLE_API_KEY2;

if (!SUPABASE_URL || !SERVICE_KEY || !GOOGLE_API_KEY) {
  throw new Error("Missing environment variables. Check .env file.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function ingestAdvice() {
  try {
    // 1. Clear the old table
    console.log("Deleting existing advice from 'mentora_advice'...");
    const { error: deleteError } = await supabase
      .from('mentora_advice')
      .delete()
      .neq('id', 0); // Deletes all rows

    if (deleteError) {
      throw new Error(`Supabase delete error: ${deleteError.message}`);
    }

    console.log(`Starting ingestion for ${ADVICE_DATA.length} advice items...`);
    const itemsToInsert = [];

    // 2. Generate embeddings for each question
    for (const item of ADVICE_DATA) {
      console.log(`Embedding question: "${item.question.substring(0, 40)}..."`);

      const embeddingResult = await embeddingModel.embedContent(item.question);
      const embedding = embeddingResult.embedding.values;

      itemsToInsert.push({
        question: item.question,
        answer: item.answer,
        embedding: embedding
      });
    }

    // 3. Insert all items into the database
    console.log("Inserting new advice into the database...");
    const { error: insertError } = await supabase
      .from('mentora_advice')
      .insert(itemsToInsert);

    if (insertError) {
      throw new Error(`Supabase insert error: ${insertError.message}`);
    }

    console.log("\n✅ Successfully ingested all advice!");

  } catch (err) {
    console.error("❌ Error during ingestion:");
    console.error(err);
  }
}

ingestAdvice();