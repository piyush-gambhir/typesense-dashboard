'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { clearConnectionConfigClient } from '@/lib/connection-config-client';

export default function DisconnectButton() {
    const router = useRouter();

    const handleDisconnect = () => {
        clearConnectionConfigClient();
        router.push('/setup');
    };

    return (
        <Button variant="destructive" onClick={handleDisconnect} className="gap-2">
            <LogOut className="h-4 w-4" /> Disconnect
        </Button>
    );
}
