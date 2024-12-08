'use client';

interface LoaderProps {
  size?: number;
  className?: string;
}

export default function Loader({ size = 40, className }: LoaderProps) {
  return (
    <div className="flex justify-center items-center h-full">
      <div
        className={`
          animate-spin
          rounded-full
          border-4
          border-primary
          border-t-transparent
          ${className}
        `}
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}
