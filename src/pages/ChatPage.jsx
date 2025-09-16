import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../Context/AuthContext';

export default function ChatPage() {
    const { personaId } = useParams();
    const { user } = useAuth();

    // State for the persona, messages, and user input
    const [persona, setPersona] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch persona details and initial chat history
    useEffect(() => {
        const fetchData = async () => {
            if (!user || !personaId) return;
            
            setLoading(true);
            // Fetch the persona's details from the 'personas' table
            const { data: personaData, error: personaError } = await supabase
                .from('personas')
                .select('*')
                .eq('id', personaId)
                .single();

            if (personaError) {
                console.error("Error fetching persona:", personaError);
                setLoading(false);
                return;
            }
            setPersona(personaData);

            // Fetch the chat history for this persona
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .eq('user_id', user.id)
                .eq('persona_id', personaId)
                .order('created_at');

            if (messagesError) {
                console.error("Error fetching messages:", messagesError);
            } else {
                setMessages(messagesData || []);
            }
            
            setLoading(false);
        };

        fetchData();
    }, [personaId, user]);

    // Handle sending a new message
    const send = async (e) => {
        e.preventDefault();
        const content = input.trim();
        if (!content) return;

        // Add user's message to the UI immediately for a responsive feel
        const userMessage = { role: "user", content, persona_id: personaId, user_id: user.id };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Save the user's message to the database
        const { error } = await supabase.from('messages').insert({ role: 'user', content, persona_id: personaId });
        if (error) console.error("Error saving message:", error);

        // --- Placeholder AI reply (we will replace this in the next step) ---
        setTimeout(() => {
            const assistantMessage = { role: "assistant", content: `Thanks for sharing. Let's break this down.` };
            setMessages((prev) => [...prev, assistantMessage]);
            // In the next step, we'll also save this assistant message to the database.
        }, 500);
    };

    if (loading) {
        return <p className="text-text-base">Loading conversation...</p>;
    }

    if (!persona) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-2 text-text-base">Persona not found</h1>
                <p className="text-text-secondary">The selected mentor is unavailable. Please go back and choose another.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-text-base">{persona.name}</h1>
                <p className="text-text-secondary">{persona.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto bg-card border border-border rounded-lg p-4 space-y-3">
                {messages.length === 0 && (
                    <p className="text-sm text-text-secondary">Start the conversation by asking a question.</p>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-md px-3 py-2 rounded-lg ${m.role === "user" ? "bg-primary text-white" : "bg-background text-text-base"}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={send} className="mt-4 flex gap-2">
                <input
                    className="flex-1 border border-border rounded-md px-3 py-2 bg-card text-text-base"
                    placeholder={`Ask ${persona.name} for guidance...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">
                    Send
                </button>
            </form>
        </div>
    );
}