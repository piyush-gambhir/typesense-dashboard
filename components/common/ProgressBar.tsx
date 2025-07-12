import { CheckCircle2, Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
    isLoading: boolean;
    progress: number;
    title?: string;
    loadingMessage?: string;
    completeMessage?: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
    showIcon?: boolean;
    className?: string;
}

export function ProgressBar({
    isLoading,
    progress,
    title = 'Loading...',
    loadingMessage = 'Please wait while we process your data.',
    completeMessage = 'Processing complete! Finalizing...',
    variant = 'default',
    showIcon = true,
    className,
}: Readonly<ProgressBarProps>) {
    if (!isLoading) return null;

    const isComplete = progress >= 100;

    const variantStyles = {
        default: {
            icon: Loader2,
            iconClass: 'text-primary',
            badgeClass: 'bg-primary/10 text-primary border-primary/20',
            progressClass: '',
        },
        success: {
            icon: CheckCircle2,
            iconClass: 'text-green-600',
            badgeClass:
                'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
            progressClass: 'bg-green-500',
        },
        warning: {
            icon: Loader2,
            iconClass: 'text-yellow-600',
            badgeClass:
                'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
            progressClass: 'bg-yellow-500',
        },
        error: {
            icon: Loader2,
            iconClass: 'text-red-600',
            badgeClass:
                'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
            progressClass: 'bg-red-500',
        },
    };

    const currentVariant = variantStyles[variant];
    const IconComponent = currentVariant.icon;

    return (
        <div
            className={cn(
                'w-full space-y-4 p-4 rounded-lg border border-border/50 bg-card/50',
                className,
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {showIcon && (
                        <IconComponent
                            className={cn(
                                'h-5 w-5',
                                currentVariant.iconClass,
                                isComplete ? '' : 'animate-spin',
                            )}
                        />
                    )}
                    <div>
                        <span className="text-sm font-semibold text-foreground">
                            {title}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isComplete ? completeMessage : loadingMessage}
                        </p>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={cn('font-medium', currentVariant.badgeClass)}
                >
                    {Math.round(progress)}%
                </Badge>
            </div>

            <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}
