import { Button } from '@/components/ui/button';

import Link from '@/components/link';

export default function NotFound() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="text-center space-y-3 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-sm font-medium text-muted-foreground">
                    404
                </span>
                <div className="space-y-1">
                    <h1 className="text-base font-medium">Page not found</h1>
                    <p className="text-xs text-muted-foreground">
                        This page doesn&apos;t exist or has been moved.
                    </p>
                </div>
                <Button asChild size="sm" className="text-sm font-medium">
                    <Link href="/">Go home</Link>
                </Button>
            </div>
        </div>
    );
}
