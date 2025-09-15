// DashboardPage.jsx
import React from 'react';
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
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Personas</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Choose a mentor persona to start a conversation.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATIC_PERSONAS.map((p) => (
          <PersonaCard key={p.id} persona={p} />
        ))}
      </div>
    </div>
  );
}