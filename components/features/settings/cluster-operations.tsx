'use client';

import {
    Activity,
    Database,
    HardDrive,
    RefreshCw,
    Server,
    Trash2,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    clearCache,
    compactDatabase,
    createSnapshot,
    getApiStats,
    getDebugInfo,
    getHealthStatus,
    reelectLeader,
    toggleSlowRequestLog,
} from '@/lib/typesense/cluster-operations';

import { toast } from '@/hooks/use-toast';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';

export default function ClusterOperations() {
    const [isLoading, setIsLoading] = useState(true);
    const [healthData, setHealthData] = useState<any>(null);
    const [debugData, setDebugData] = useState<any>(null);
    const [statsData, setStatsData] = useState<any>(null);
    const [snapshotPath, setSnapshotPath] = useState('/tmp/typesense-snapshot');
    const [slowLogMs, setSlowLogMs] = useState('');
    const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
    const [isSlowLogOpen, setIsSlowLogOpen] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState<
        string | null
    >(null);

    const fetchClusterInfo = async () => {
        setIsLoading(true);
        try {
            const [health, debug, stats] = await Promise.all([
                getHealthStatus(),
                getDebugInfo(),
                getApiStats(),
            ]);
            if (health.success) setHealthData(health.data);
            if (debug.success) setDebugData(debug.data);
            if (stats.success) setStatsData(stats.data);
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to fetch cluster information.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClusterInfo();
    }, []);

    const handleOperation = async (
        operation: string,
        fn: () => Promise<{ success: boolean; error?: string; data?: any }>,
        successMessage: string,
    ) => {
        setOperationInProgress(operation);
        try {
            const result = await fn();
            if (result.success) {
                toast({ title: 'Success', description: successMessage });
                fetchClusterInfo();
            } else {
                toast({
                    title: 'Error',
                    description: result.error || `Failed to ${operation}.`,
                    variant: 'destructive',
                });
            }
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : `Failed to ${operation}.`,
                variant: 'destructive',
            });
        } finally {
            setOperationInProgress(null);
        }
    };

    const handleSnapshot = async () => {
        if (!snapshotPath.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please provide a snapshot path.',
                variant: 'destructive',
            });
            return;
        }
        setIsSnapshotOpen(false);
        await handleOperation(
            'snapshot',
            () => createSnapshot(snapshotPath),
            `Snapshot created at ${snapshotPath}.`,
        );
    };

    const handleSlowLog = async () => {
        const ms = parseInt(slowLogMs);
        if (isNaN(ms)) {
            toast({
                title: 'Validation Error',
                description:
                    'Please provide a valid number (use -1 to disable).',
                variant: 'destructive',
            });
            return;
        }
        setIsSlowLogOpen(false);
        await handleOperation(
            'slow-log',
            () => toggleSlowRequestLog(ms),
            ms === -1
                ? 'Slow request logging disabled.'
                : `Slow request log threshold set to ${ms}ms.`,
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Cluster Operations
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage cluster health, snapshots, compaction, and
                    configuration.
                </p>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        Health
                    </div>
                    <div>
                        {healthData?.ok ? (
                            <Badge variant="default" className="bg-green-600">
                                Healthy
                            </Badge>
                        ) : (
                            <Badge variant="destructive">Unhealthy</Badge>
                        )}
                    </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        Version
                    </div>
                    <p className="text-sm font-mono">
                        {debugData?.version || 'Unknown'}
                    </p>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        State
                    </div>
                    <p className="text-sm font-mono">
                        {debugData?.state !== undefined
                            ? debugData.state
                            : 'Unknown'}
                    </p>
                </div>
            </div>

            {/* Operations */}
            <div>
                <h2 className="text-lg font-medium mb-3">Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Snapshot */}
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Create Snapshot
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Save a point-in-time snapshot of the database.
                            </p>
                        </div>
                        <Dialog
                            open={isSnapshotOpen}
                            onOpenChange={setIsSnapshotOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={operationInProgress !== null}
                                >
                                    <HardDrive className="mr-2 h-3.5 w-3.5" />
                                    Snapshot
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Snapshot</DialogTitle>
                                    <DialogDescription>
                                        Specify the directory path where the
                                        snapshot should be saved.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    <Label htmlFor="snapshot-path">
                                        Snapshot Path
                                    </Label>
                                    <Input
                                        id="snapshot-path"
                                        value={snapshotPath}
                                        onChange={(e) =>
                                            setSnapshotPath(e.target.value)
                                        }
                                        placeholder="/tmp/typesense-snapshot"
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSnapshotOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSnapshot}>
                                        Create Snapshot
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Compact */}
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Compact Database
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Compact the on-disk database to reclaim space.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={operationInProgress !== null}
                            onClick={() =>
                                handleOperation(
                                    'compact',
                                    compactDatabase,
                                    'Database compaction completed.',
                                )
                            }
                        >
                            {operationInProgress === 'compact' ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Zap className="mr-2 h-3.5 w-3.5" />
                                    Compact
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Re-elect Leader */}
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Re-elect Leader
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Trigger a Raft leader re-election (cluster mode
                                only).
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={operationInProgress !== null}
                            onClick={() =>
                                handleOperation(
                                    'vote',
                                    reelectLeader,
                                    'Leader re-election triggered.',
                                )
                            }
                        >
                            {operationInProgress === 'vote' ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    Re-elect
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Clear Cache */}
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Clear Cache</p>
                            <p className="text-xs text-muted-foreground">
                                Clear the in-memory search response cache.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={operationInProgress !== null}
                            onClick={() =>
                                handleOperation(
                                    'cache',
                                    clearCache,
                                    'Cache cleared successfully.',
                                )
                            }
                        >
                            {operationInProgress === 'cache' ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Clear
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Slow Request Log */}
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Slow Request Log
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Configure slow request logging threshold (ms).
                                Use -1 to disable.
                            </p>
                        </div>
                        <Dialog
                            open={isSlowLogOpen}
                            onOpenChange={setIsSlowLogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={operationInProgress !== null}
                                >
                                    Configure
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Slow Request Log</DialogTitle>
                                    <DialogDescription>
                                        Set the threshold in milliseconds for
                                        logging slow requests. Use -1 to
                                        disable.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    <Label htmlFor="slow-log-ms">
                                        Threshold (ms)
                                    </Label>
                                    <Input
                                        id="slow-log-ms"
                                        type="number"
                                        value={slowLogMs}
                                        onChange={(e) =>
                                            setSlowLogMs(e.target.value)
                                        }
                                        placeholder="-1"
                                        className="font-mono text-sm"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSlowLogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSlowLog}>
                                        Apply
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* API Stats */}
            {statsData && (
                <div>
                    <h2 className="text-lg font-medium mb-3">API Stats</h2>
                    <div className="border rounded-lg overflow-auto">
                        <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                            {JSON.stringify(statsData, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
