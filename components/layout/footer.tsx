export default function Footer() {
    return (
        <footer className="border-t border-border/30 bg-background">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                    <span>Typesense Dashboard</span>
                    <span>
                        Built with{' '}
                        <a
                            href="https://typesense.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Typesense
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
