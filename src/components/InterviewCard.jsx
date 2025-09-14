import { Mic } from "lucide-react";

const InterviewCard = ({ interview }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border">
      <div className="flex items-start space-x-4">
        <Mic className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{interview.title}</h3>
          <p className="text-gray-600 mt-2 mb-4">{interview.description}</p>
          <button className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
