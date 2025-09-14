// src/pages/ResourcesPage.jsx
import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import { Search } from "lucide-react";
import { getCourses } from "../services/resourcesProvider";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCourses({ search: searchTerm, category, level });
        if (alive) setCourses(data);
      } catch (e) {
        console.error(e);
        if (alive) setError("Failed to load courses");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchTerm, category, level]); // filter-driven loading [16]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Find Your Next Course
      </h1>
      <p className="text-gray-600 mb-8">
        Search courses from Coursera, edX, and Udemy.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-lg border">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by course title..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search courses"
          />
        </div>
        <select
          className="w-full p-2 border rounded-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          <option value="cs">Computer Science</option>
          <option value="health">Health</option>
          <option value="legal">Legal</option>
          <option value="sports">Sports</option>
        </select>
        <select
          className="w-full p-2 border rounded-md"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Filter by level"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.length > 0 ? (
            courses.map((c) => <CourseCard key={c.id} course={c} />)
          ) : (
            <p className="md:col-span-2 text-center text-gray-500">
              No courses found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
