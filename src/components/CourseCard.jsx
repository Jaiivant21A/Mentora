import { GraduationCap } from "lucide-react";



const platformColors = {
    Coursera: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Udemy: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    edX: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "Google Books": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    YouTube: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};



const CourseCard = ({ course }) => {

    return (

        <div className="bg-card p-5 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">

            <div className="flex items-start space-x-4">

                <GraduationCap className="h-8 w-8 text-primary mt-1 flex-shrink-0" />

                <div>

                    <h4 className="font-bold text-text-base">{course.title}</h4>

                    <div className="flex items-center space-x-2 mt-2 text-sm">

                        <span

                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${platformColors[course.platform]}`}

                        >

                            {course.platform}

                        </span>

                        <span className="text-text-secondary">•</span>

                        <span className="capitalize text-text-secondary">{course.level}</span>

                    </div>

                    <a

                        href={course.url}

                        target="_blank"

                        rel="noopener noreferrer"

                        className="inline-block mt-4 text-primary font-semibold hover:underline"

                    >

                        View Course &rarr;

                    </a>

                </div>

            </div>

        </div>

    );

};



export default CourseCard;