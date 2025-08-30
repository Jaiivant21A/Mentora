// src/pages/InterviewSession.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const STORE_KEY = 'mentora-interviews';
const loadAll = () => { try{ const r = localStorage.getItem(STORE_KEY); return r? JSON.parse(r):[]; } catch{ return []; } };
const saveAll = (arr) => localStorage.setItem(STORE_KEY, JSON.stringify(arr));

const BANK = {
  behavioral: [
    'Tell me about yourself (use STAR).',
    'Describe a challenge you faced and how you handled it.',
    'When did you lead a team? What was the outcome?',
  ],
  react: [
    'Explain useEffect and its dependency array.',
    'How would you manage global state in React?',
    'What are keys in lists and why are they important?',
  ],
  system: [
    'Design a URL shortener.',
    'How would you scale a chat application?',
    'Discuss caching layers and their trade-offs.',
  ],
};

export default function InterviewSession(){
  const [params] = useSearchParams();
  const type = params.get('type') || 'behavioral';
  const questions = BANK[type] || BANK.behavioral;

  const nav = useNavigate();
  const [answers, setAnswers] = useState(()=> Array(questions.length).fill(''));
  const [idx, setIdx] = useState(0);
  const [sessionId] = useState(()=> crypto.randomUUID());
  const [startedAt] = useState(()=> Date.now());

  const autosave = () => {
    const all = loadAll();
    const rec = { id: sessionId, type, startedAt, answers, completedAt: null, updatedAt: Date.now() };
    const i = all.findIndex(s => s.id === sessionId);
    const next = i>=0 ? (all[i]=rec, [...all]) : [rec, ...all];
    saveAll(next);
  };

  useEffect(()=> { autosave(); }, [answers]); // write-through autosave [15]

  const finish = () => {
    const all = loadAll();
    const rec = { id: sessionId, type, startedAt, answers, completedAt: Date.now(), updatedAt: Date.now() };
    const i = all.findIndex(s => s.id === sessionId);
    const next = i>=0 ? (all[i]=rec, [...all]) : [rec, ...all];
    saveAll(next);
    nav('/interviews');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Interview: {type}</h1>
      <p className="text-gray-600 mb-4">Question {idx+1} of {questions.length}</p>

      <div className="bg-white border rounded-lg p-4 mb-4">
        <p className="font-semibold mb-2">{questions[idx]}</p>
        <textarea
          className="w-full border rounded-md p-3 min-h-[140px]"
          placeholder="Type your answer here..."
          value={answers[idx]}
          onChange={(e)=>{
            const next = answers.slice();
            next[idx] = e.target.value;
            setAnswers(next);
          }}
        />
      </div>

            <div className="flex gap-2">
        <button disabled={idx===0} onClick={()=>setIdx(i=>i-1)} className="px-4 py-2 rounded-md border disabled:opacity-50">Back</button>
        {idx < questions.length-1 ? (
          <button onClick={()=>setIdx(i=>i+1)} className="px-4 py-2 rounded-md bg-primary text-white">Next</button>
        ) : (
          <button onClick={finish} className="px-4 py-2 rounded-md bg-primary text-white">Finish</button>
        )}
        <button onClick={autosave} className="ml-auto px-4 py-2 rounded-md border">Save</button>
        <button
          onClick={()=>{
            if (!confirm('Delete this session?')) return;
            const all = loadAll().filter(s => s.id !== sessionId);
            saveAll(all);
            nav('/interviews');
          }}
          className="px-4 py-2 rounded-md border text-red-600 border-red-300 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

    </div>
  );
}
