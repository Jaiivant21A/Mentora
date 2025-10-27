import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { supabase } from '../lib/supabaseClient';
import { PauseCircle, PlayCircle } from 'lucide-react';

// A small helper component to format and display the time
const Timer = ({ seconds, isPaused }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <div className={`text-2xl font-semibold ${isPaused ? 'text-yellow-500' : 'text-text-base'}`}>
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </div>
  );
};

// Styles for the difficulty tags
const difficultyStyles = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
};

const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes

export default function InterviewSession() {
    const { sessionId } = useParams();
    const [params] = useSearchParams();
    const type = params.get("type") || "behavioral";
    const difficulty = params.get("difficulty") || "medium";
    
    const nav = useNavigate();
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]); 
    const [answers, setAnswers] = useState([]);
    const [idx, setIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const [view, setView] = useState('loading'); 
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState("");
    
    // --- NEW: State to hold the final summary ---
    const [summary, setSummary] = useState("");
    // ------------------------------------------
    
    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
      if (isTimerRunning && timeLeft > 0) {
        const timerId = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(timerId);
      }
      
      if (isTimerRunning && timeLeft === 0) {
        setIsTimerRunning(false);
        finish(); 
      }
    }, [isTimerRunning, timeLeft]);

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
                nav('/interviews');
            } else {
                setSession(data);
                
                if (data.completed_at) {
                    setFeedback(data.questions); // 'questions' col holds the feedback array
                    setSummary(data.summary);   // Load the saved summary
                    setView('results');
                } else {
                    setQuestions(data.questions || []); 
                    setAnswers(data.answers || Array(data.questions?.length || 0).fill(""));
                    setView('ready');
                }
            }
            setLoading(false);
        };
        if (sessionId) fetchSession();
    }, [sessionId, nav]);

    const saveProgress = useCallback(async (currentAnswers) => {
        const { error } = await supabase
            .from('interview_sessions')
            .update({ answers: currentAnswers })
            .eq('id', sessionId);
        if (error) console.error("Autosave failed", error);
    }, [sessionId]);

    const handleAnswerChange = (e) => {
        const newAnswers = [...answers];
        newAnswers[idx] = e.target.value;
        setAnswers(newAnswers);
        saveProgress(newAnswers);
    };

    // --- UPDATED 'finish' function ---
    const finish = async () => {
        if (view === 'grading') return; 
        
        setView('grading'); 
        setIsTimerRunning(false);
        setError("");
        await saveProgress(answers); 

        try {
            const questionStrings = questions.map(q => q.question);

            // 1. Call the grading function
            const { data: functionData, error: functionError } = await supabase.functions.invoke(
                'grade-answers',
                { body: { questions: questionStrings, answers, difficulty } } 
            );

            if (functionError) throw functionError;
            
            // functionData now contains { feedback: [], summary: "..." }

            // 2. Create the results array for the 'questions' column
            const results = questionStrings.map((q, i) => ({
                question: q,
                answer: answers[i] || "No answer provided.",
                difficulty: questions[i].difficulty,
                good: functionData.feedback[i].good,
                missing: functionData.feedback[i].missing,
            }));

            // 3. Save everything to the database
            const { error: updateError } = await supabase
                .from('interview_sessions')
                .update({ 
                    completed_at: new Date(),
                    questions: results,           // Save the full feedback
                    summary: functionData.summary // Save the new AI summary
                })
                .eq('id', sessionId);

            if (updateError) throw updateError;

            // 4. Set state to show results
            setFeedback(results);
            setSummary(functionData.summary);
            setView('results');

        } catch (err) {
            console.error("Failed to grade session:", err);
            setError("An error occurred while grading. Please try again.");
            setView('answering');
        }
    };
    // -----------------------------------

    const deleteSession = async () => {
        if (!confirm("Delete this session?")) return;
        const { error } = await supabase.from('interview_sessions').delete().eq('id', sessionId);
        if (error) console.error("Failed to delete session", error);
        nav("/interviews");
    };

    const startInterview = () => {
      setView('answering');
      setIsTimerRunning(true);
    };

    if (view === 'loading') return <p className="text-text-base p-6">Loading session...</p>;
    
    // --- UPDATED 'results' view ---
    if (view === 'results') {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-2 capitalize text-text-base">Interview Feedback: {type} - {difficulty}</h1>
                
                {/* --- NEW: Display the AI Summary --- */}
                <p className="text-lg text-primary font-semibold bg-primary/10 p-4 rounded-md mb-6">
                    "{summary || 'Great work completing the session!'}"
                </p>
                {/* ------------------------------------ */}
                
                <h2 className="text-xl font-bold text-text-base mb-4">Detailed Breakdown</h2>
                <div className="space-y-6">
                    {Array.isArray(feedback) && feedback.map((item, i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-text-base">Q: {item.question}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyStyles[item.difficulty] || difficultyStyles.default}`}>
                                    {item.difficulty}
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary p-3 bg-background rounded-md mb-3 whitespace-pre-wrap">
                                <span className="font-semibold">Your answer:</span> {item.answer}
                            </p>
                            <div className="text-sm">
                                <p className="text-green-500"><span className="font-semibold text-green-400">What was good:</span> {item.good}</p>
                                <p className="text-yellow-500 mt-1"><span className="font-semibold text-yellow-400">What to improve:</span> {item.missing}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={() => nav('/interviews')} className="mt-6 px-4 py-2 rounded-md bg-primary text-white">
                    Back to Interviews
                </button>
            </div>
        );
    }
    // ---------------------------------

    if (view === 'ready') {
        return (
            <div className="p-6 text-center">
                <h1 className="text-3xl font-bold mb-2 capitalize text-text-base">Interview: {type} - {difficulty}</h1>
                <p className="text-text-secondary mb-4">You will have 30 minutes to answer 10 questions.</p>
                <p className="text-text-secondary mb-8">The timer will start as soon as you begin.</p>
                <button 
                    onClick={startInterview} 
                    className="px-6 py-3 rounded-md bg-primary text-white text-lg font-semibold"
                >
                    Start Interview
                </button>
            </div>
        );
    }

    // --- 'answering' view ---
    const currentQuestion = questions[idx];
    const currentDifficulty = currentQuestion?.difficulty || 'medium';

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1 capitalize text-text-base">Interview: {type}</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-text-secondary">Question {idx + 1} of {questions.length}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyStyles[currentDifficulty]}`}>
                            {currentDifficulty}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Timer seconds={timeLeft} isPaused={!isTimerRunning} />
                    <button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)} 
                        className="p-2 rounded-full hover:bg-background"
                        title={isTimerRunning ? "Pause" : "Resume"}
                    >
                        {isTimerRunning ? <PauseCircle className="text-text-secondary" /> : <PlayCircle className="text-text-secondary" />}
                    </button>
                </div>
            </div>

            {questions.length > 0 ? (
                <>
                    <div className="bg-card border border-border rounded-lg p-4 mb-4">
                        <p className="font-semibold mb-2 text-text-base">{currentQuestion?.question}</p>
                        <textarea
                            className="w-full border border-border rounded-md p-3 min-h-[140px] bg-background text-text-base"
                            placeholder="Type your answer here..."
                            value={answers[idx] || ""}
                            onChange={handleAnswerChange}
                            disabled={view === 'grading' || !isTimerRunning}
                        />
                    </div>
                </>
            ) : (
                <p className="text-text-secondary mb-4">No questions loaded for this session.</p>
            )}

            <div className="h-6 mb-3">
                {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex gap-2">
                <button 
                    disabled={idx === 0 || view === 'grading' || !isTimerRunning} 
                    onClick={() => setIdx(i => i - 1)} 
                    className="px-4 py-2 rounded-md border border-border bg-button-secondary text-text-secondary disabled:opacity-50"
                >
                    Back
                </button>
                {idx < questions.length - 1 ? (
                    <button 
                        onClick={() => setIdx(i => i + 1)} 
                        disabled={view === 'grading' || !isTimerRunning}
                        className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                ) : (
                    <button 
                        onClick={finish} 
                        disabled={view === 'grading' || !isTimerRunning}
                        className="px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50"
                    >
                        {view === 'grading' ? 'Grading...' : 'Finish & Get Feedback'}
                    </button>
                )}
                <button 
                    onClick={deleteSession} 
                    disabled={view === 'grading'}
                    className="ml-auto px-4 py-2 rounded-md border text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}