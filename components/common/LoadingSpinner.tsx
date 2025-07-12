import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    variant?: 'default' | 'primary' | 'muted';
    fullScreen?: boolean;
}

export default function LoadingSpinner({
    className,
    size = 'md',
    text,
    variant = 'default',
    fullScreen = false,
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };

    const variantClasses = {
        default: 'text-foreground',
        primary: 'text-primary',
        muted: 'text-muted-foreground',
    };

    const content = (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3',
                className,
            )}
        >
            <Loader2
                className={cn(
                    'animate-spin',
                    sizeClasses[size],
                    variantClasses[variant],
                )}
            />
            {text && (
                <span
                    className={cn(
                        'text-sm font-medium',
                        variant === 'muted'
                            ? 'text-muted-foreground'
                            : 'text-foreground',
                    )}
                >
                    {text}
                </span>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}
