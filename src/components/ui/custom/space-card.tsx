import React from 'react';
import { cn } from '@/lib/utils';

type SpaceCardVariant = 'default' | 'gradient' | 'glass';

interface SpaceCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: SpaceCardVariant;
    glowing?: boolean;
    hoverable?: boolean;
}

const variantClasses: Record<SpaceCardVariant, string> = {
    default: 'border border-white/10 bg-transparent backdrop-blur-sm shadow-[0_0_18px_rgba(10,14,42,0.45)]',
    gradient: 'border border-space-cyan-400/50 bg-gradient-to-br from-[#0b1a57]/80 via-[#123070]/65 to-[#0a174b]/85 shadow-[0_0_26px_rgba(74,100,255,0.32)]',
    glass: 'border border-white/20 bg-white/12 backdrop-blur-xl shadow-[0_0_26px_rgba(106,207,246,0.22)]'
};

const hoverEffects: Record<SpaceCardVariant, string[]> = {
    default: ['hover:border-space-cyan-400', 'hover:shadow-[0_0_24px_rgba(106,207,246,0.25)]'],
    gradient: ['hover:shadow-[0_0_32px_rgba(74,100,255,0.35)]'],
    glass: ['hover:bg-white/20', 'hover:border-white/40', 'hover:shadow-[0_0_28px_rgba(106,207,246,0.25)]']
};

const SpaceCard: React.FC<SpaceCardProps> = ({
                                                 children,
                                                 className,
                                                 variant = 'default',
                                                 glowing = false,
                                                 hoverable = false
                                             }) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-lg transition-all duration-300',
                variantClasses[variant],
                hoverable && ['cursor-pointer hover:scale-[1.02]', ...hoverEffects[variant]],
                glowing && [
                    'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-space-cyan-400/20 before:to-space-blue-600/15 before:blur-lg before:-z-10'
                ],
                className
            )}
        >
            {glowing && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-space-cyan-400/20 to-space-blue-600/15 blur-lg -z-10"></div>
            )}
            <div className="relative z-10 w-full">{children}</div>
        </div>
    );
};

export { SpaceCard };
