import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <div className="min-h-screen bg-background relative">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
                    {/* Hero Section */}
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-center mb-6 gap-3">
                            <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-primary-foreground"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                                    Typesense Dashboard
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    Search analytics & management
                                </p>
                            </div>
                        </div>

                        <div className="max-w-md mx-auto">
                            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                                Manage collections, documents, search analytics,
                                and monitor performance.
                            </p>

                            {/* Feature highlights — flat, no cards */}
                            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mb-10">
                                <span className="flex items-center gap-1.5">
                                    <svg
                                        className="w-3.5 h-3.5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                    Collections
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1.5">
                                    <svg
                                        className="w-3.5 h-3.5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Analytics
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1.5">
                                    <svg
                                        className="w-3.5 h-3.5 text-primary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                    Metrics
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300 delay-100">
                        <Link href="/collections">
                            <Button
                                size="sm"
                                className="h-9 px-5 text-sm font-medium"
                            >
                                View Collections
                            </Button>
                        </Link>
                        <Link href="/settings/general">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-5 text-sm font-medium"
                            >
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
