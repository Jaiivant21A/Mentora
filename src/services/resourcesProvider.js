// src/services/resourcesProvider.js

import { supabase } from "../lib/supabaseClient.js"; // Make sure this path is correct

export async function getCourses({
  search = "",
  category = "all",
  level = "all",
} = {}) {
  
  const { data, error } = await supabase.functions.invoke('get-resources', {
    body: { search, category, level },
  });

  if (error) {
    console.error("Error invoking Supabase function:", error);
    throw new Error(error.message);
  }

  return data;
}