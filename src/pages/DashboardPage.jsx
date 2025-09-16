import React from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaCard from "../components/PersonaCard";

// Static data for the personas with images
const STATIC_PERSONAS = [
    {
        id: '1',
        name: 'React Expert',
        description: 'A senior software engineer who specializes in React.',
        initial_prompt: 'You are a senior React software engineer. I am a junior developer. Let\'s practice a coding interview.',
        // image_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=React', // Placeholder for a React icon
    },
    {
        id: '2',
        name: 'System Design Architect',
        description: 'An expert in building scalable, distributed systems.',
        initial_prompt: 'You are a system design architect. Let\'s discuss the design of a large-scale application.',
        // image_url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=System', // Placeholder for a System icon
    },
    {
        id: '3',
        name: 'Behavioral Interview Coach',
        description: 'Helps you craft compelling stories for behavioral questions.',
        initial_prompt: 'You are a behavioral interview coach. Let\'s work on a challenging behavioral question.',
        // image_url: 'https://via.placeholder.com/150/008000/FFFFFF?text=Behavioral', // Placeholder for a Behavioral icon
    },
];

export default function DashboardPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-background text-text-base min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Personas</h1>
                <p className="text-lg text-text-secondary">
                    Choose a mentor persona to start a conversation.
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STATIC_PERSONAS.map((persona) => (
                        <div
                            key={persona.id}
                            className="bg-card rounded-lg shadow-md p-6 border border-border"
                        >
                            <h3 className="text-xl font-semibold mb-2 text-text-base">{persona.name}</h3>
                            <p className="text-text-secondary">
                                {persona.description}
                            </p>
                            <button
                                onClick={() => navigate(`/chat/${persona.id}`)}
                                className="mt-4 inline-block text-primary hover:underline"
                            >
                                Start Chat
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}