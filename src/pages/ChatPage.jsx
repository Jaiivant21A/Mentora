import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../context/AuthContext.jsx";

// --- Curriculum Data (Same as before) ---
const TOPIC_GUIDES = {
  dsa: {
    beginner: ['Arrays & Strings', 'Linked Lists', 'Stacks', 'Queues'],
    intermediate: ['Hash Maps', 'Trees (BST)', 'Heaps', 'Graphs (Intro)'],
    advanced: ['Dynamic Programming', 'Tries', 'Advanced Graphs', 'Segment Trees']
  },
  sys: {
    beginner: ['What is System Design?', 'Load Balancers', 'Databases (SQL vs NoSQL)', 'Caching'],
    intermediate: ['API Design', 'Microservices', 'Sharding', 'Replication'],
    advanced: ['Distributed Cache', 'MapReduce', 'Consistent Hashing', 'Leader Election']
  },
  web: {
    beginner: ['HTML & CSS', 'JavaScript DOM', 'React Basics', 'Async (Fetch)'],
    intermediate: ['React Hooks', 'Node.js & Express', 'REST APIs', 'Authentication'],
    advanced: ['WebSockets', 'GraphQL', 'Docker', 'Microfrontends']
  }
};

const WELCOME_MESSAGE = {
  id: "asst_welcome_1",
  role: "assistant",
  content: "Hello! I'm your mentor. To get started, please choose the level you'd like to focus on today."
};

// --- Helper Components (Same as before) ---
function PathChoiceButtons({ onSelect }) {
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSelect('beginner')} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Beginner: Start from the basics
        </button>
        <button onClick={() => onSelect('intermediate')} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Intermediate: Review and build
        </button>
        <button onClick={() => onSelect('advanced')} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Advanced: Show me complex topics
        </button>
      </div>
    </div>
  );
}
function TopicButtons({ topicKey, selectedLevel, onSelect }) {
  const topics = TOPIC_GUIDES[topicKey]?.[selectedLevel] || [];
  return (
    <div className="p-4">
      <p className="text-sm font-semibold text-text-base mb-2">
        Great! Here are the {selectedLevel} topics. What would you like to learn?
      </p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button key={topic} onClick={() => onSelect(topic)} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
function LessonControlButtons({ onContinue, onAskFollowup, hasMoreSteps }) {
  return (
    <div className="mt-4 flex gap-2">
      {hasMoreSteps ? (
        <button onClick={onContinue} className="flex-1 bg-primary text-white px-4 py-2 rounded-md">
          Continue to next sub-topic
        </button>
      ) : (
        <button className="flex-1 bg-card text-text-secondary px-4 py-2 rounded-md border border-border" disabled>
          Lesson complete!
        </button>
      )}
      <button onClick={onAskFollowup} className="flex-1 bg-card text-text-secondary px-4 py-2 rounded-md border border-border hover:bg-border">
        Ask a follow-up question
      </button>
    </div>
  );
}
function FollowupInputForm({ onSubmit, onCancel, isReplying }) {
  const [input, setInput] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        className="w-full border border-border rounded-md px-3 py-2 bg-card text-text-base disabled:opacity-50"
        placeholder={isReplying ? "Waiting for reply..." : "Ask your follow-up question..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isReplying}
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50" disabled={isReplying}>
          Send
        </button>
        <button type="button" onClick={onCancel} className="bg-card text-text-secondary px-4 py-2 rounded-md border border-border hover:bg-border">
          Cancel
        </button>
      </div>
    </form>
  );
}
// ----------------------------------------


export default function ChatPage() {
  const { personaId } = useParams();
  const { user } = useAuth();
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);

  const [convoState, setConvoState] = useState('path_choice');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  
  const messagesEndRef = useRef(null);
  const topicKey = useMemo(() => personaId?.split('-')[0], [personaId]);
  
  // --- NEW: Simplified key ---
  const sessionLessonKey = `mentora_lesson_${personaId}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- NEW: Simplified Load Effect ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !personaId) return;
      setLoading(true);

      const { data: personaData } = await supabase
        .from('personas').select('*').eq('id', personaId).single();
      setPersona(personaData);

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('persona_id', personaId)
        .order('created_at');

      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData);
        
        // Restore lesson state from sessionStorage
        const savedLesson = sessionStorage.getItem(sessionLessonKey);
        if (savedLesson) {
          setCurrentLesson(JSON.parse(savedLesson));
          setConvoState('teaching_lesson'); // ALWAYS go to lesson controls
        } else {
          // Has history, but no lesson in progress. Go to topic choice.
          setConvoState('topic_choice');
        }

      } else {
        // No messages, this is a brand new chat
        setMessages([WELCOME_MESSAGE]);
        setConvoState('path_choice');
      }
      
      setLoading(false);
    };
    fetchData();
  }, [personaId, user, sessionLessonKey]);
  // --- END OF FIX ---

  // --- NEW: Simplified Save Effect ---
  // This effect now *only* worries about saving the lesson
  useEffect(() => {
    if (loading || !personaId) return; // Don't save while loading

    if (currentLesson) {
      // If a lesson is in progress, save it
      sessionStorage.setItem(sessionLessonKey, JSON.stringify(currentLesson));
    } else {
      // If no lesson (e.g., it finished), remove it
      sessionStorage.removeItem(sessionLessonKey);
    }
    
  }, [currentLesson, loading, personaId, sessionLessonKey]);
  // ---------------------------------

  const callMentorBot = async (body) => {
    setIsReplying(true);

    let explanationResponse = "";
    let conclusionResponse = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-bot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      explanationResponse = data.explanation;
      conclusionResponse = data.conclusion;

      const explanationMessage = {
        id: `asst_ex_${Date.now()}`,
        role: "assistant",
        content: explanationResponse,
        persona_id: personaId,
        user_id: user.id
      };
      setMessages((prev) => [...prev, explanationMessage]);
      await supabase.from('messages').insert(explanationMessage);

      // Set the lesson state *first*
      setCurrentLesson({
        plan: data.lessonPlan,
        step: data.currentStep,
      });
      
      if (conclusionResponse) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const conclusionMessage = {
          id: `asst_con_${Date.now()}`,
          role: "assistant",
          content: conclusionResponse,
          persona_id: personaId,
          user_id: user.id
        };
        setMessages((prev) => [...prev, conclusionMessage]);
        await supabase.from('messages').insert(conclusionMessage);
      }

      // Now set the UI state
      setConvoState('teaching_lesson');

    } catch (error) {
      console.error("Error calling mentor-bot function:", error);
      explanationResponse = `Sorry, I had trouble with that: ${error.message}`;
      setMessages((prev) => [
        ...prev,
        { id: `asst_err_${Date.now()}`, role: "assistant", content: explanationResponse }
      ]);
      setConvoState('teaching_followup');
    }

    setIsReplying(false);
  };

  const addAndSaveUserMessage = async (content) => {
    const userMessage = { role: "user", content, persona_id: personaId, user_id: user.id };
    setMessages((prev) => [...prev, userMessage]);
    await supabase.from('messages').insert(userMessage);
  };

  const handlePathSelect = (level) => {
    addAndSaveUserMessage(`I'd like to learn at the ${level} level.`);
    setSelectedLevel(level);
    setConvoState('topic_choice');
  };

  const handleTopicSelect = (topicName) => {
    const query = `Teach me about ${topicName}`;
    addAndSaveUserMessage(query);
    callMentorBot({ query: query, topic: topicKey });
  };

  const handleContinueLesson = () => {
    if (!currentLesson) return;
    const nextStep = currentLesson.step + 1;
    
    if (nextStep >= currentLesson.plan.length) {
      // Failsafe: lesson is over, clear state
      setCurrentLesson(null);
      setConvoState('topic_choice');
      return;
    }
    
    const nextSubTopic = currentLesson.plan[nextStep];
    addAndSaveUserMessage(`Continue with: ${nextSubTopic}`);
    callMentorBot({
      lessonPlan: currentLesson.plan,
      currentStep: nextStep,
      topic: topicKey,
    });
  };

  const handleAskFollowup = () => {
    setConvoState('teaching_followup');
  };

  const handleFollowupSubmit = (query) => {
    addAndSaveUserMessage(query);
    // A follow-up is a one-off question. It *ends* the formal lesson.
    setCurrentLesson(null);
    callMentorBot({ query: query, topic: topicKey });
  };

  const handleResetChat = async () => {
    await supabase.from('messages').delete().eq('user_id', user.id).eq('persona_id', personaId);
    sessionStorage.removeItem(sessionLessonKey); // Clear saved lesson
    setMessages([WELCOME_MESSAGE]);
    setConvoState('path_choice');
    setSelectedLevel(null);
    setCurrentLesson(null);
    setIsReplying(false);
  };

  if (loading) {
    return <p className="text-text-base">Loading conversation...</p>;
  }
  if (!persona) {
    return <p>Persona not found.</p>;
  }

  const hasMoreSteps = currentLesson && (currentLesson.step < currentLesson.plan.length - 1);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-text-base">{persona.name}</h1>
          <p className="text-text-secondary">{persona.description}</p>
        </div>
        <button onClick={handleResetChat} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Reset Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-card border border-border rounded-lg p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id || m.content} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div 
              className={`
                max-w-md px-3 py-2 rounded-lg prose prose-sm 
                ${m.role === "user" ? "bg-primary text-white prose-invert" : "bg-background text-text-base"}
              `}
            >
              <ReactMarkdown>
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {isReplying && (
          <div className="flex justify-start">
            <div className="max-w-md px-3 py-2 rounded-lg bg-background text-text-base">
              <span className="italic text-text-secondary">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Conditional Input Area (This logic is now robust) --- */}
      <div className="mt-4">
        {!isReplying && (
          <>
            {convoState === 'path_choice' && (
              <PathChoiceButtons onSelect={handlePathSelect} />
            )}
            
            {convoState === 'topic_choice' && (
              <TopicButtons 
                topicKey={topicKey} 
                selectedLevel={selectedLevel} 
                onSelect={handleTopicSelect} 
              />
            )}
            
            {convoState === 'teaching_lesson' && (
              <LessonControlButtons 
                onContinue={handleContinueLesson}
                onAskFollowup={handleAskFollowup}
                hasMoreSteps={hasMoreSteps}
              />
            )}

            {convoState === 'teaching_followup' && (
              <FollowupInputForm
                onSubmit={handleFollowupSubmit}
                onCancel={() => {
                  // This logic is now safe.
                  if (currentLesson) {
                    setConvoState('teaching_lesson');
                  } else {
                    // This is the new safe fallback
                    setConvoState('topic_choice');
                  }
                }}
                isReplying={isReplying}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}