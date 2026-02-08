'use client';

interface LoaderProps {
    size?: number;
    className?: string;
}

export default function Loader({ size = 32, className }: LoaderProps) {
    return (
        <div className="flex flex-col justify-center items-center h-full gap-3">
            <div className="relative">
                <div
                    className={`
                        animate-spin
                        rounded-full
                        border-[1.5px]
                        border-border
                        border-t-primary
                        ${className}
                    `}
                    style={{
                        width: size,
                        height: size,
                    }}
                />
            </div>
            <p className="text-[10px] text-muted-foreground/60 animate-pulse">
                Loading
            </p>
        </div>
    );
}
