import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../Context/AuthContext';

// Keep the question bank as static data in the component.
const BANK = {
  behavioral: ["Tell me about yourself.", "Describe a challenge you faced.", "When did you lead a team?"],
  react: ["Explain useEffect.", "How would you manage global state?", "What are keys in lists?"],
  system: ["Design a URL shortener.", "How would you scale a chat app?", "Discuss caching layers."],
};

export default function InterviewSession() {
  const { sessionId } = useParams(); // Get the session ID from the URL.
  const [params] = useSearchParams();
  const type = params.get("type") || "behavioral";
  const questions = BANK[type] || BANK.behavioral;
  
  const nav = useNavigate();
  const [session, setSession] = useState(null); // Holds the entire session object from DB.
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(""));
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // This useEffect fetches the session data from Supabase on page load.
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (error) {
        console.error("Could not fetch session", error);
        nav('/interviews'); // Go back if session not found
      } else {
        setSession(data);
        // Load existing answers or initialize new ones.
        setAnswers(data.answers || Array(questions.length).fill(""));
      }
      setLoading(false);
    };
    if (sessionId) fetchSession();
  }, [sessionId, questions.length, nav]);

  // Save progress to the database.
  const saveProgress = useCallback(async (currentAnswers) => {
    const { error } = await supabase
      .from('interview_sessions')
      .update({ answers: currentAnswers })
      .eq('id', sessionId);
    if (error) console.error("Autosave failed", error);
  }, [sessionId]);

  // Handle text changes and trigger save.
  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[idx] = e.target.value;
    setAnswers(newAnswers);
    saveProgress(newAnswers); // Autosave on change
  };

  // Mark the session as complete in the database.
  const finish = async () => {
    await saveProgress(answers); // Save final answers
    const { error } = await supabase
      .from('interview_sessions')
      .update({ completed_at: new Date() })
      .eq('id', sessionId);
    if (error) console.error("Failed to finish session", error);
    nav("/interviews");
  };

  // Delete the session from the database.
  const deleteSession = async () => {
    if (!confirm("Delete this session?")) return;
    const { error } = await supabase.from('interview_sessions').delete().eq('id', sessionId);
    if (error) console.error("Failed to delete session", error);
    nav("/interviews");
  };

  if (loading) return <p>Loading session...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 capitalize">Interview: {type}</h1>
      <p className="text-gray-600 mb-4">Question {idx + 1} of {questions.length}</p>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 mb-4">
        <p className="font-semibold mb-2">{questions[idx]}</p>
        <textarea
          className="w-full border rounded-md p-3 min-h-[140px] dark:bg-gray-900"
          placeholder="Type your answer here..."
          value={answers[idx] || ""} // Ensure a blank space is shown
          onChange={handleAnswerChange}
        />
      </div>

      <div className="flex gap-2">
        <button disabled={idx === 0} onClick={() => setIdx(i => i - 1)} className="px-4 py-2 rounded-md border disabled:opacity-50">Back</button>
        {idx < questions.length - 1 ? (
          <button onClick={() => setIdx(i => i + 1)} className="px-4 py-2 rounded-md bg-primary text-white">Next</button>
        ) : (
          <button onClick={finish} className="px-4 py-2 rounded-md bg-primary text-white">Finish</button>
        )}
        <button onClick={deleteSession} className="ml-auto px-4 py-2 rounded-md border text-red-600 border-red-300 hover:bg-red-50">Delete</button>
      </div>
    </div>
  );
}