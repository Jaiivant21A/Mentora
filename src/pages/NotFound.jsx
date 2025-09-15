import { Link } from "react-router-dom"; // Import the Link component

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The page you were looking for doesn’t exist.
        </p>

        {/* A link to help the user navigate back to the app. */}
        <Link 
          to="/dashboard" 
          className="text-primary font-semibold hover:underline"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}