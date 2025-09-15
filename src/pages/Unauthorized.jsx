import { Link } from "react-router-dom"; // Import the Link component

export default function Unauthorized() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Unauthorized
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Access denied for this section.
        </p>

        {/* A link to help the user navigate back to the app. */}
        <Link 
          to="/dashboard" 
          className="text-primary font-semibold hover:underline"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}