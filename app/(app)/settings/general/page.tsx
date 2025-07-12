import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function GeneralSettings() {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                    Typesense connection is now configured via environment
                    variables.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">
                            Environment Variables
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Configure your Typesense connection using these
                            environment variables:
                        </p>
                        <ul className="text-sm space-y-1 font-mono">
                            <li>TYPESENSE_HOST</li>
                            <li>TYPESENSE_PORT</li>
                            <li>TYPESENSE_PROTOCOL</li>
                            <li>TYPESENSE_API_KEY</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
