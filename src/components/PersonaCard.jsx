// src/components/PersonaCard.jsx
import { Link } from "react-router-dom";

const PersonaCard = ({ persona }) => {
  if (!persona) return null;
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <img
          src={persona.avatar}
          alt={persona.name}
          className="h-12 w-12 rounded-full object-cover"
          loading="lazy"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {persona.name}
          </h3>
          <p className="text-sm text-gray-600">
            {persona.field} • {persona.tagline}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mt-3 line-clamp-3">{persona.bio}</p>

      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-500">Tone: {persona.tone}</span>
        <Link
          className="text-primary font-semibold underline"
          to={`/chat/${persona.id}`}
          aria-label={`Open chat with ${persona.name}`}
        >
          Chat
        </Link>
      </div>
    </div>
  );
};

export default PersonaCard;
