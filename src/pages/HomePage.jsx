import { Link } from "react-router-dom";
import { BotMessageSquare, Target, GraduationCap, Mic } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
    const { user } = useAuth();

    return (
        <div className="bg-background text-text-base">
            <header className="bg-card shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <BotMessageSquare className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">Mentora</span>
                    </div>
                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="text-text-secondary hover:text-primary transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/auth"
                                    className="text-text-secondary hover:text-primary transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/auth"
                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="text-center py-20 md:py-32 px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold text-text-base leading-tight">
                    Your AI Mentor for a Career in Tech
                </h1>
                <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
                    Get personalized guidance, practice technical interviews, and find curated resources to advance your tech career.
                </p>
                <Link
                    to="/dashboard"
                    className="mt-8 inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
                >
                    Start Your Journey
                </Link>
            </main>

            {/* Features Section */}
            <section className="bg-card py-20">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-10 text-center">
                    <div>
                        <BotMessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Expert Personas</h3>
                        <p className="text-text-secondary">
                            Get insights from AI mentors specializing in core computer science topics and tech industry careers.
                        </p>
                    </div>
                    <div>
                        <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Find Courses</h3>
                        <p className="text-text-secondary">
                            Discover targeted video tutorials from YouTube and in-depth guides from Google Books, curated for your learning path.
                        </p>
                    </div>
                    <div>
                        <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Mock Interviews</h3>
                        <p className="text-text-secondary">
                            Practice technical interviews focused on CS domains and receive instant, detailed feedback to improve your skills.
                        </p>
                    </div>
                    <div>
                        <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Goal Tracking</h3>
                        <p className="text-text-secondary">
                            Set and manage your personal learning goals and deadlines to stay on track and motivated.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;