import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    variant?: 'default' | 'primary' | 'muted';
}

export function LoadingSpinner({
    className,
    size = 'md',
    text,
    variant = 'default',
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

    return (
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
}

// Card loading skeleton
export function CardLoading({ 
    className, 
    title = true, 
    description = true,
    content = 3 
}: {
    className?: string;
    title?: boolean;
    description?: boolean;
    content?: number;
}) {
    return (
        <div className={cn('space-y-3 p-6', className)}>
            {title && <Skeleton className="h-5 w-32" />}
            {description && <Skeleton className="h-4 w-48" />}
            <div className="space-y-2">
                {Array.from({ length: content }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                ))}
            </div>
        </div>
    );
}

// Table loading skeleton
export function TableLoading({ 
    rows = 5, 
    columns = 4,
    showHeader = true 
}: {
    rows?: number;
    columns?: number;
    showHeader?: boolean;
}) {
    return (
        <div className="space-y-3">
            {showHeader && (
                <div className="flex space-x-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
            )}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex space-x-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-10 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Stats grid loading skeleton
export function StatsGridLoading({ 
    items = 4,
    className 
}: {
    items?: number;
    className?: string;
}) {
    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="space-y-2 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-full" />
                </div>
            ))}
        </div>
    );
}

// Full page loading
export function PageLoading({ text }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <LoadingSpinner size="lg" />
            {text && (
                <p className="text-muted-foreground text-sm">{text}</p>
            )}
        </div>
    );
}

// Button loading state
export function ButtonLoading({ 
    children, 
    loading = false,
    ...props 
}: {
    children: React.ReactNode;
    loading?: boolean;
} & React.ComponentProps<'button'>) {
    return (
        <button {...props} disabled={loading || props.disabled}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}