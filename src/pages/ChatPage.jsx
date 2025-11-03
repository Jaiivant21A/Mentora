import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "../context/AuthContext.jsx";

// --- Curriculum Data (for "Study" Mode) ---
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
  content: "Hello! I'm your mentor. How can I help you today?"
};

// --- Helper Components (No Changes) ---
function PathChoiceButtons({ onSelect }) {
  return (
    <div className="p-4">
      <p className="text-sm font-semibold text-text-base mb-2">
        Great! What level should we focus on?
      </p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSelect('beginner')} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Beginner
        </button>
        <button onClick={() => onSelect('intermediate')} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Intermediate
        </button>
        <button onClick={() => onSelect('advanced')} className="px-3 py-1.5 bg-card text-text-secondary rounded-md text-sm border border-border hover:bg-border">
          Advanced
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
        Here are the {selectedLevel} topics. What's on your mind?
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
function ModeSelectionButtons({ onSelectMode }) {
  return (
    <div className="p-4 flex flex-col md:flex-row gap-4">
      <button 
        onClick={() => onSelectMode('study')}
        className="flex-1 p-4 bg-card border border-border rounded-lg text-left hover:bg-border"
      >
        <h3 className="font-semibold text-text-base">💬 Start a Study Session</h3>
        <p className="text-sm text-text-secondary">Learn a new topic from scratch with a guided, conversational lesson.</p>
      </button>
      <button 
        onClick={() => onSelectMode('advice')}
        className="flex-1 p-4 bg-card border border-border rounded-lg text-left hover:bg-border"
      >
        <h3 className="font-semibold text-text-base">💡 Get Career Advice </h3>
        <p className="text-sm text-text-secondary">Ask a specific career question (e.g., "How do I build a resume?, Give me a roadmap to develop my skills").</p>
      </button>
    </div>
  );
}
function ChatInputForm({ onSubmit, isReplying, placeholder, onCancel = null }) {
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
        placeholder={isReplying ? "Waiting for reply..." : placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isReplying}
      />
      <div className="mt-2 flex gap-2">
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50" disabled={isReplying}>
          Send
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-card text-text-secondary px-4 py-2 rounded-md border border-border hover:bg-border">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// --- NEW: Helper to load state from sessionStorage ---
const getInitialState = (personaId) => {
  const storedState = sessionStorage.getItem(`chatState_${personaId}`);
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (e) {
      console.error("Failed to parse stored chat state", e);
      // Fallback to default if parsing fails
    }
  }
  // Default fresh state
  return {
    messages: [WELCOME_MESSAGE],
    chatMode: 'select',
    studyState: 'level',
    selectedLevel: null,
  };
};

// ----------------------------------------

export default function ChatPage() {
  const { personaId } = useParams();
  const { user } = useAuth();

  // --- NEW: Initialize state lazily from getInitialState ---
  const [messages, setMessages] = useState(() => getInitialState(personaId).messages);
  const [chatMode, setChatMode] = useState(() => getInitialState(personaId).chatMode);
  const [studyState, setStudyState] = useState(() => getInitialState(personaId).studyState);
  const [selectedLevel, setSelectedLevel] = useState(() => getInitialState(personaId).selectedLevel);

  // --- Other state (not saved) ---
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  
  const messagesEndRef = useRef(null);
  const topicKey = useMemo(() => personaId?.split('-')[0], [personaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- NEW: Effect to SAVE state to sessionStorage ---
  useEffect(() => {
    // We don't want to save while loading, as state might be in-flux
    if (!loading && personaId) {
      const stateToSave = {
        messages,
        chatMode,
        studyState,
        selectedLevel,
      };
      sessionStorage.setItem(`chatState_${personaId}`, JSON.stringify(stateToSave));
    }
  }, [messages, chatMode, studyState, selectedLevel, personaId, loading]);

  // --- MODIFIED: This effect now ONLY loads persona data ---
  // The chat state is handled by the initializers and the reset button.
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !personaId) return;
      setLoading(true);

      const { data: personaData } = await supabase
        .from('personas').select('*').eq('id', personaId).single();
      setPersona(personaData);
      
      setLoading(false);
    };
    fetchData();
  }, [personaId, user]);

  // --- Helper to add a user message and save it ---
  const addAndSaveUserMessage = async (content) => {
    const userMessage = { role: "user", content, persona_id: personaId, user_id: user.id };
    // This state update will trigger the save-to-storage effect
    setMessages((prev) => [...prev, userMessage]); 
    await supabase.from('messages').insert(userMessage);
  };
  
  // --- Bot Call 1: "Advice" (RAG) ---
  const callAdviceBot = async (query) => {
    setIsReplying(true);
    const assistantMessageId = `asst_rag_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "", persona_id: personaId, user_id: user.id }
    ]);
    let fullContent = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/find-advice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ query: query, personaId: personaId }),
        }
      );

      if (!response.ok || !response.body) {
        const err = await response.json();
        throw new Error(err.error || `HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error calling find-advice:", error);
      fullContent = `Sorry, I had trouble with that: ${error.message}`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
        )
      );
    }

    setIsReplying(false);
    await supabase.from('messages').insert({
      role: 'assistant', content: fullContent, persona_id: personaId, user_id: user.id,
    });
  };
  
  // --- Bot Call 2: "Study" (Conversational) ---
  const callStudyBot = async (query) => {
    setIsReplying(true);
    const assistantMessageId = `asst_study_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "", persona_id: personaId, user_id: user.id }
    ]);
    let fullContent = "";

    const historyToSend = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            history: historyToSend,
            query: query,
            personaId: personaId
          }),
        }
      );

      if (!response.ok || !response.body) {
        const err = await response.json();
        throw new Error(err.error || `HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error calling study-session:", error);
      fullContent = `Sorry, I had trouble with that: ${error.message}`;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
        )
      );
    }

    setIsReplying(false);
    await supabase.from('messages').insert({
      role: 'assistant', content: fullContent, persona_id: personaId, user_id: user.id,
    });
  };

  // --- State Handlers (No changes) ---
  const handleSelectMode = (mode) => {
    setChatMode(mode);
    if (mode === 'advice') {
      addAndSaveUserMessage("I'd like to get some career advice.");
    }
    if (mode === 'study') {
      addAndSaveUserMessage("I'd like to start a study session.");
      setStudyState('level');
    }
  };
  
  const handlePathSelect = (level) => {
    addAndSaveUserMessage(`I'd like to learn at the ${level} level.`);
    setSelectedLevel(level);
    setStudyState('topic');
  };

  const handleTopicSelect = (topicName) => {
    const query = `Let's start by learning about ${topicName}.`;
    addAndSaveUserMessage(query);
    setStudyState('chat'); // Move to open chat
    callStudyBot(query); // Call the conversational bot
  };

  const handleStudySubmit = (query) => {
    addAndSaveUserMessage(query);
    callStudyBot(query);
  };
  
  const handleAdviceSubmit = (query) => {
    addAndSaveUserMessage(query);
    callAdviceBot(query); // Call the RAG bot
  };

  // --- MODIFIED: handleResetChat now clears sessionStorage ---
  const handleResetChat = async () => {
    await supabase.from('messages').delete().eq('user_id', user.id).eq('persona_id', personaId);
    
    // Clear the stored state
    sessionStorage.removeItem(`chatState_${personaId}`);

    // Manually reset the state to defaults
    setMessages([WELCOME_MESSAGE]);
    setChatMode('select');
    setStudyState('level');
    setSelectedLevel(null);
    setIsReplying(false);
  };

  // --- Helper to determine what to show in the input area (No changes) ---
  const renderInputArea = () => {
    if (isReplying) return null; // No input while bot is replying

    if (chatMode === 'select') {
      return <ModeSelectionButtons onSelectMode={handleSelectMode} />;
    }
    
    if (chatMode === 'study') {
      if (studyState === 'level') {
        return <PathChoiceButtons onSelect={handlePathSelect} />;
      }
      if (studyState === 'topic') {
        return <TopicButtons topicKey={topicKey} selectedLevel={selectedLevel} onSelect={handleTopicSelect} />;
      }
      if (studyState === 'chat') {
        return <ChatInputForm onSubmit={handleStudySubmit} isReplying={isReplying} placeholder="Ask a follow-up or say 'continue'..." />;
      }
    }
    
    if (chatMode === 'advice') {
      return <ChatInputForm onSubmit={handleAdviceSubmit} isReplying={isReplying} placeholder="Ask a specific career question..." />;
    }
    
    return null;
  };

  // --- Render Logic (No changes) ---
  if (loading) {
    return <p className="text-text-base">Loading conversation...</p>;
  }
  if (!persona) {
    return <p>Persona not found.</p>;
  }

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

      <div className="mt-4">
        {renderInputArea()}
      </div>
    </div>
  );
}