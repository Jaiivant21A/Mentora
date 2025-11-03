import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- NEW Updated Persona Data ---
const STATIC_PERSONAS = [
  {
    id: 'dsa-narayanan',
    name: 'David Wallace',
    field: 'Data Structures & Algorithms',
    description: 'A computer science educator specializing in algorithm optimization.',
    initials: 'DW',
    color: '3B82F6', // Blue
  },
  {
    id: 'web-choi',
    name: 'Alex Johnson',
    field: 'Web Development',
    description: 'A senior full-stack engineer passionate about modern web development.',
    initials: 'AJ',
    color: '10B981', // Green
  },
  {
    id: 'sys-ramirez',
    name: 'Marcus Cole',
    field: 'System Design',
    description: 'A principal systems architect experienced in designing scalable distributed systems.',
    initials: 'MC',
    color: 'F59E0B', // Yellow
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

        {/* --- NEW Single-Column List Layout --- */}
        <div className="mt-8 flex flex-col gap-6">
          {STATIC_PERSONAS.map((persona) => {
            const avatarUrl = `https://ui-avatars.com/api/?name=${persona.initials}&background=${persona.color}&color=fff&size=64&bold=true`;
            
            return (
              <div
                key={persona.id}
                // --- NEW Card Design ---
                className="bg-card rounded-lg shadow-md p-6 border border-border flex flex-row items-center gap-6"
              >
                {/* Avatar */}
                <img
                  src={avatarUrl}
                  alt={persona.name}
                  className="w-16 h-16 rounded-full shadow-sm flex-shrink-0"
                />
                
                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text-base">{persona.name}</h3>
                  <p className="text-sm text-text-base font-medium">
                    <span className="text-text-secondary">Field:</span> {persona.field}
                  </p>
                  <p className="text-text-secondary text-sm mt-1">{persona.description}</p>
                </div>

                {/* Button */}
                <button
                  onClick={() => navigate(`/chat/${persona.id}`)}
                  className="ml-auto text-primary hover:underline font-medium px-4 py-2"
                >
                  Start Chat
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}