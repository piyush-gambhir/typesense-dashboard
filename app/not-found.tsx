import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import Link from '@/components/link';

export default function NotFound() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="text-center space-y-4 max-w-md">
                <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                    <h1>404 - Page Not Found</h1>
                </div>
                <p className="text-xl">
                    The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <p className="text-sm text-muted-foreground">
                    You may have mistyped the address or the page may have
                    moved.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/">Go back home</Link>
                </Button>
            </div>
        </div>
    );
}
