// PersonaCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function PersonaCard({ persona }) {
  const { id, name, description, initial_prompt, image_url } = persona;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        {image_url && (
          <img src={image_url} alt={name} className="w-16 h-16 rounded-full mr-4" />
        )}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{name}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <Link
        to={`/interview/${id}?prompt=${encodeURIComponent(initial_prompt)}`}
        className="text-primary font-semibold hover:underline"
      >
        Start Chat
      </Link>
    </div>
  );
}