import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-primary-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
                  Typesense Dashboard
                </h1>
                <p className="text-xl text-muted-foreground">
                  Modern search analytics & management
                </p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Manage collections, documents, search analytics, and monitor 
                performance with a beautiful, intuitive interface designed for 
                developers and administrators.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Collection Management</h3>
                  <p className="text-sm text-muted-foreground">Create, update, and manage your search collections with ease</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Search Analytics</h3>
                  <p className="text-sm text-muted-foreground">Monitor search performance and user behavior patterns</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-card/50 border border-border/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Performance Metrics</h3>
                  <p className="text-sm text-muted-foreground">Track cluster health and system performance in real-time</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/collections">
              <Button size="lg" className="h-12 px-8">
                View Collections
              </Button>
            </Link>
            <Link href="/settings/general">
              <Button variant="outline" size="lg" className="h-12 px-8">
                Environment Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
