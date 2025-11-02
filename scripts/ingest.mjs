import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

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

// --- 1. YOUR KNOWLEDGE BASE (NOW WITH CORRECTED URLS) ---
// --- 1. YOUR KNOWLEDGE BASE (NOW WITH FIXED LINKS v2) ---
const URLS_TO_SCRAPE = [
  // --- Beginner DSA ---
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/dsa/introduction-to-strings-data-structure-and-algorithm-tutorials/' }, // Arrays & Strings
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/dsa/linked-list-meaning-in-dsa/' }, // Linked Lists
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/dsa/stack-notes-for-gate-exam/' }, // Stacks
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/queue-data-structure/' }, // Queues
  // --- Intermediate DSA ---
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/hashing-data-structure/' }, // Hash Maps
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/' }, // Trees (BST)
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/dsa/binary-heap-notes-for-gate-exam/' }, // Heaps
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/maths/fundamentals-of-graph-theory/' }, // Graphs (Intro)
  // --- Advanced DSA ---
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/dsa/how-does-dynamic-programming-work/' }, // Dynamic Programming
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/introduction-to-trie-data-structure-and-algorithm-tutorials/' }, // Tries
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/dsa/graph-based-algorithms-for-gate-exam/' }, // Advanced Graphs
  { topic: 'dsa', url: 'https://www.geeksforgeeks.org/segment-tree-data-structure/' }, // Segment Trees

  // --- Beginner System Design ---
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/interview-experiences/how-to-crack-system-design-round-in-interviews/' }, // What is System Design? (FIXED)
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/system-design/what-is-load-balancer-system-design/' }, // Load Balancers
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/sql/sql-vs-nosql-which-one-is-better-to-use/' }, // Databases (SQL vs NoSQL)
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/system-design/server-side-caching-and-client-side-caching/' }, // Caching
  // --- Intermediate System Design ---
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/system-design/api-contracts-system-design/' }, // API Design
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/system-design/microservices-architecture-for-enterprise-large-scaled-application/' }, // Microservices (FIXED)
  { topic: 'sys', url: 'https://www.mongodb.com/resources/products/capabilities/database-sharding-explained' }, // Sharding
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/dbms/data-replication-in-dbms/' }, // Replication
  // --- Advanced System Design ---
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/system-design/design-distributed-cache-system-design/' }, // Distributed Cache
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/data-engineering/hadoop-mapreduce-data-flow/' }, // MapReduce (FIXED)
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/consistent-hashing/' }, // Consistent Hashing
  { topic: 'sys', url: 'https://www.geeksforgeeks.org/system-design/what-is-leader-election-in-a-distributed-system/' }, // Leader Election (FIXED)

  // --- Beginner Web Development ---
  { topic: 'web', url: 'https://www.geeksforgeeks.org/html-introduction/' }, // HTML & CSS (GfG for HTML)
  { topic: 'web', url: 'https://www.geeksforgeeks.org/css-introduction/' }, // (And one for CSS)
  { topic: 'web', url: 'https://www.freecodecamp.org/news/an-introduction-to-the-javascript-dom-512463dd62ec/' }, // JavaScript DOM
  { topic: 'web', url: 'https://react.dev/learn' }, // React Basics
  { topic: 'web', url: 'https://www.freecodecamp.org/news/javascript-fetch-api-for-beginners/' }, // Async (Fetch)
  // --- Intermediate Web Development ---
  { topic: 'web', url: 'https://react.dev/learn/managing-state' }, // React Hooks (covered in React state docs)
  { topic: 'web', url: 'https://www.freecodecamp.org/news/the-express-handbook/' }, // Node.js & Express
  { topic: 'web', url: 'https://www.geeksforgeeks.org/rest-api-introduction/' }, // REST APIs
  { topic: 'web', url: 'httpsD://www.geeksforgeeks.org/computer-networks/authentication-in-computer-network/' }, // Authentication
  // --- Advanced Web Development ---
  { topic: 'web', url: 'https://www.geeksforgeeks.org/system-design/websockets-for-real-time-distributed-systems/' }, // WebSockets
  { topic: 'web', url: 'https://graphql.org/learn/' }, // GraphQL
  { topic: 'web', url: 'https://www.geeksforgeeks.org/devops/docker-tutorial/' }, // Docker
  { topic: 'web', url: 'https://www.geeksforgeeks.org/system-design/what-are-micro-frontends/' }, // Microfrontends (FIXED)
];
// ----------------------------------------
// ----------------------------------------

function splitIntoChunks(text) {
  const chunks = text.split('\n\n');
  return chunks
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 50); 
}

async function scrapeAndEmbed(topic, url) {
  console.log(`\nScraping { topic: "${topic}", url: "${url}" }`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
    }
    const html = await response.text();

    const doc = new JSDOM(html, { url: url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      console.warn(`  ⚠️ Could not parse article content from: ${url}`);
      return [];
    }

    const content = article.textContent;
    console.log(`  ✅ Parsed article: "${article.title}"`);

    const chunks = splitIntoChunks(content);
    console.log(`  Split into ${chunks.length} chunks.`);

    const chunksToInsert = [];
    for (const chunk of chunks) {
      const embeddingResult = await embeddingModel.embedContent(chunk);
      const embedding = embeddingResult.embedding.values;

      chunksToInsert.push({
        topic: topic,
        content: chunk,
        embedding: embedding
      });
    }
    return chunksToInsert;

  } catch (err) {
    console.error(`  ❌ Error scraping ${url}: ${err.message}`);
    return [];
  }
}

async function ingestData() {
  try {
    let allChunks = [];
    for (const item of URLS_TO_SCRAPE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fileChunks = await scrapeAndEmbed(item.topic, item.url);
      allChunks = allChunks.concat(fileChunks);
    }

    if (allChunks.length === 0) {
      console.log("No new data to ingest.");
      return;
    }

    console.log("\nDeleting all existing documents from the database...");
    const { error: deleteError } = await supabase.from('documents').delete().neq('id', 0);
    if (deleteError) throw new Error(`Supabase delete error: ${deleteError.message}`);
    
    console.log(`\nStarting batch insert of ${allChunks.length} total chunks...`);
    
    const BATCH_SIZE = 100;
    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('documents').insert(batch);
      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }
      console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(allChunks.length / BATCH_SIZE)}`);
    }

    console.log("\n✅ Successfully ingested all data!");

  } catch (err) {
    console.error("❌ Error during ingestion:", err.message);
  }
}

ingestData();