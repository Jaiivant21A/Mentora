import React, { useState, useEffect } from 'react';
import CourseCard from "../components/CourseCard";
import { Search } from "lucide-react";
import { getCourses } from "../services/resourcesProvider"; // Stays the same for now

// Custom hook for debouncing input. A common performance optimization.
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  // Use the debounced search term for the API request.
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");
        // The getCourses function is now called with the debounced search term.
        const data = await getCourses({ search: debouncedSearchTerm, category, level });
        setCourses(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
    // This effect now runs only when the user stops typing or changes a filter.
  }, [debouncedSearchTerm, category, level]);

  // The JSX for this component remains the same, as it was already well-structured.
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Find Your Next Course
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Search courses from Coursera, edX, and Udemy.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by course title..."
            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="w-full p-2 border rounded-md dark:bg-gray-900" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="cs">Computer Science</option>
          <option value="health">Health</option>
          <option value="legal">Legal</option>
          <option value="sports">Sports</option>
        </select>
        <select className="w-full p-2 border rounded-md dark:bg-gray-900" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading && <p className="text-gray-500 dark:text-gray-400">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.length > 0 ? (
            courses.map((c) => <CourseCard key={c.id} course={c} />)
          ) : (
            <p className="md:col-span-2 text-center text-gray-500 dark:text-gray-400">
              No courses found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}