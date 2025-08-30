import { Target } from 'lucide-react';

const GoalTracker = ({ goal }) => {
  const { title, progress, deadline } = goal;
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start space-x-4">
        <Target className="h-6 w-6 text-primary mt-1" />
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-800">{title}</h4>
            <span className="text-sm font-semibold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div
              className="bg-accent h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-gray-500">
            Deadline: {deadline}
          </p>
        </div>
      </div>
    </div>
  );
};
export default GoalTracker;