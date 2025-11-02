import React from 'react';
import { useNavigate } from 'react-router-dom';
import PersonaCard from "../components/PersonaCard.jsx";

// Static data for the personas (DSA, Web Development, System Design)
const STATIC_PERSONAS = [
  {
    id: 'dsa-narayanan',
    name: 'Priya Narayanan',
    description: 'A computer science educator specializing in Data Structures & Algorithms.',
    initial_prompt:
      "You are Priya Narayanan, a mentor who helps me strengthen my understanding of Data Structures and Algorithms through examples and explanations.",
    image_url: 'https://ui-avatars.com/api/?name=PN&background=3B82F6&color=fff',
  },
  {
    id: 'web-choi',
    name: 'Daniel Choi',
    description: 'A full-stack developer passionate about modern web development.',
    initial_prompt:
      "You are Daniel Choi, a senior web developer who guides me in learning modern frontend and backend concepts with React, Node.js, and best practices.",
    image_url: 'https://ui-avatars.com/api/?name=DC&background=10B981&color=fff',
  },
  {
    id: 'sys-ramirez',
    name: 'Carlos Ramirez',
    description: 'A systems architect experienced in designing scalable distributed systems.',
    initial_prompt:
      "You are Carlos Ramirez, a system design mentor who helps me understand architecture tradeoffs, scalability, and reliability principles.",
    image_url: 'https://ui-avatars.com/api/?name=CR&background=F59E0B&color=fff',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-text-base min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Mentora Personas</h1>
        <p className="text-lg text-text-secondary">
          Choose a mentor persona to start your learning conversation.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATIC_PERSONAS.map((persona) => (
            <div
              key={persona.id}
              className="bg-card rounded-lg shadow-md p-6 border border-border flex flex-col items-center text-center"
            >
              <img
                src={persona.image_url}
                alt={persona.name}
                className="w-20 h-20 rounded-full mb-4 shadow-sm"
              />
              <h3 className="text-xl font-semibold mb-2 text-text-base">{persona.name}</h3>
              <p className="text-text-secondary text-sm">{persona.description}</p>
              <button
                onClick={() => navigate(`/chat/${persona.id}`)}
                className="mt-4 inline-block text-primary hover:underline font-medium"
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
