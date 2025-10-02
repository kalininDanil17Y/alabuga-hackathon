import React from 'react';
import { cn } from '@/lib/utils';

interface SpaceProgressProps {
    value: number;
    max: number;
    label?: string;
    className?: string;
    showPercentage?: boolean;
    showValues?: boolean;
    animated?: boolean;
}

const SpaceProgress: React.FC<SpaceProgressProps> = ({
                                                         value,
                                                         max,
                                                         label,
                                                         className,
                                                         showPercentage = false,
                                                         showValues = true,
                                                         animated = true
                                                     }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={cn('space-y-2', className)}>
            {/* Label and Values */}
            {(label || showValues || showPercentage) && (
                <div className="flex justify-between items-center">
                    {label && <span className="text-white text-sm">{label}</span>}
                    <div className="flex items-center space-x-2">
                        {showValues && (
                            <span className="text-white text-sm">{value}/{max}</span>
                        )}
                        {showPercentage && (
                            <span className="text-space-cyan-400 text-xs">
                {Math.round(percentage)}%
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="relative">
                {/* Background */}
                <div className="w-full bg-space-blue-800/50 rounded-full h-2 overflow-hidden">
                    {/* Progress Fill */}
                    <div
                        className={cn(
                            'h-full bg-gradient-to-r from-space-cyan-400 to-space-blue-500 rounded-full',
                            animated && 'transition-all duration-500 ease-out'
                        )}
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Glowing effect */}
                        <div className="w-full h-full bg-gradient-to-r from-space-cyan-300/50 to-space-blue-400/50 rounded-full"></div>
                    </div>
                </div>

                {/* Glow effect */}
                <div
                    className={cn(
                        'absolute top-0 h-full bg-gradient-to-r from-space-cyan-400 to-space-blue-500 rounded-full blur-sm opacity-30',
                        animated && 'transition-all duration-500 ease-out'
                    )}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export { SpaceProgress };
