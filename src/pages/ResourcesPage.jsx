import React, { useState, useEffect } from 'react';

import CourseCard from "../components/CourseCard.jsx";

import { Search } from "lucide-react";

import { getCourses } from "../services/resourcesProvider.js";



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



    const debouncedSearchTerm = useDebounce(searchTerm, 500);



    useEffect(() => {

        const fetchCourses = async () => {

            try {

                setLoading(true);

                setError("");

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

    }, [debouncedSearchTerm, category, level]);



    return (

        <div className="p-6">

            <h1 className="text-3xl font-bold text-text-base mb-2">

                Find Your Next Course

            </h1>

            <p className="text-text-secondary mb-8">

                Search courses from Coursera, edX, and Udemy.

            </p>



            <div className="grid md:grid-cols-3 gap-4 mb-8 bg-card p-4 rounded-lg border border-border">

                <div className="relative">

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />

                    <input

                        type="text"

                        placeholder="Search by course title..."

                        className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-text-base border-border"

                        value={searchTerm}

                        onChange={(e) => setSearchTerm(e.target.value)}

                    />

                </div>

                <select className="w-full p-2 border rounded-md bg-background text-text-base border-border" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="ds-algo">Data Structures & Algorithms</option>
                <option value="web-dev">Web Development (Frontend)</option>
                <option value="system-design">System Design</option>
                </select>

                <select className="w-full p-2 border rounded-md bg-background text-text-base border-border" value={level} onChange={(e) => setLevel(e.target.value)}>

                    <option value="all">All Levels</option>

                    <option value="beginner">Beginner</option>

                    <option value="intermediate">Intermediate</option>

                    <option value="advanced">Advanced</option>

                </select>

            </div>



            {loading && <p className="text-text-secondary">Loading…</p>}

            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (

                <div className="grid md:grid-cols-2 gap-6">

                    {courses.length > 0 ? (

                        courses.map((c) => <CourseCard key={c.id} course={c} />)

                    ) : (

                        <p className="md:col-span-2 text-center text-text-tertiary">

                            No courses found matching your criteria.

                        </p>

                    )}

                </div>

            )}

        </div>

    );

}