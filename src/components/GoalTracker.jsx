import React from 'react';
import { CircleGauge, CalendarIcon } from 'lucide-react';

const GoalTracker = ({ goal }) => {
    // Determine the color of the progress bar
    const progressColor = goal.progress >= 100 ? "bg-green-600" : "bg-primary";

    // Format deadline for display
    const formattedDeadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : 'No deadline';

    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-card text-text-base border border-border shadow-sm">
            {/* Goal Icon */}
            <div className="flex-shrink-0">
                <CircleGauge className="h-8 w-8 text-primary" />
            </div>

            {/* Goal Details */}
            <div className="flex-grow">
                <h4 className="font-semibold text-text-base">{goal.title}</h4>
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formattedDeadline}</span>
                </div>
            </div>

            {/* Progress Bar & Status */}
            <div className="flex-shrink-0 w-32 md:w-48">
                <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-primary">
                            {goal.progress}%
                        </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${goal.progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalTracker;