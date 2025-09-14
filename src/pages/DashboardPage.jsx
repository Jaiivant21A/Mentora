// src/pages/DashboardPage.jsx
import PersonaCard from "../components/PersonaCard";
import { personas } from "../services/personas";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Personas</h1>
      <p className="text-gray-600 mb-6">
        Choose a mentor persona to start a conversation.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((p) => (
          <PersonaCard key={p.id} persona={p} />
        ))}
      </div>
    </div>
  );
}
