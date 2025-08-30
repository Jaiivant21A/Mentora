import { GraduationCap } from 'lucide-react';

const platformColors = {
  Coursera: 'bg-blue-100 text-blue-800',
  Udemy: 'bg-purple-100 text-purple-800',
  edX: 'bg-red-100 text-red-800',
};

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <GraduationCap className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-gray-800">{course.title}</h4>
          <div className="flex items-center space-x-2 mt-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${platformColors[course.platform]}`}>
              {course.platform}
            </span>
            <span className="text-gray-500">•</span>
            <span className="capitalize text-gray-600">{course.level}</span>
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