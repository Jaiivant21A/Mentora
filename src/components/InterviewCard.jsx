import { Mic } from "lucide-react";

const InterviewCard = ({ interview }) => {
    return (
        <div className="bg-card p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-border">
            <div className="flex items-start space-x-4">
                <Mic className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                <div>
                    <h3 className="text-xl font-bold text-text-base">{interview.title}</h3>
                    <p className="text-text-secondary mt-2 mb-4">{interview.description}</p>
                    <button className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Start Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;