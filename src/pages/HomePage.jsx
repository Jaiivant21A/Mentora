import { Link } from "react-router-dom";
import { BotMessageSquare, Target, GraduationCap, Mic } from "lucide-react";
// The useAuth import is no longer needed since the header is removed.
// import { useAuth } from "../Context/AuthContext";

const HomePage = () => {
  // The user check is no longer needed here since the header is removed.
  // const { user } = useAuth();

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* The <header> component was removed from here. */}

      {/* Hero Section */}
      <main className="text-center py-20 md:py-32 px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
          Your AI Mentor for Every Career Goal
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Get personalized guidance, practice for interviews, find the best
          courses, and achieve your professional ambitions with AI-powered
          personas.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          Start Your Journey
        </Link>
      </main>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-10 text-center">
          <div>
            <BotMessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Expert Personas</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Chat with AI mentors from any field—from law to computer science.
            </p>
          </div>
          <div>
            <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Find Courses</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Discover top courses from Coursera, edX, and Udemy tailored to
              you.
            </p>
          </div>
          <div>
            <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Mock Interviews</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Practice behavioral and technical interviews with an AI hiring
              manager.
            </p>
          </div>
          <div>
            <Target className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Goal Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set and track your SMART goals to stay motivated and accountable.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;