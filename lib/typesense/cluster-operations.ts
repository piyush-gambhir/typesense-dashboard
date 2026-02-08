import { getTypesenseClient } from '@/lib/typesense/typesense-client';

export interface SnapshotResponse {
    success: boolean;
    snapshot_path?: string;
    error?: string;
}

export interface DebugInfo {
    state: number;
    version: string;
}

// Create a snapshot of the database
export async function createSnapshot(snapshotPath: string) {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.post(
            `/operations/snapshot?snapshot_path=${encodeURIComponent(snapshotPath)}`,
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error creating snapshot:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Compact the database
export async function compactDatabase() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.post(
            '/operations/db/compact',
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error compacting database:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Re-elect the leader node (cluster mode)
export async function reelectLeader() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.post(
            '/operations/vote',
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error triggering re-election:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Toggle slow request log threshold
// Set to -1 to disable, or a positive integer for milliseconds
export async function toggleSlowRequestLog(logSlowRequestsTimeMs: number) {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.post(
            '/config',
            { 'log-slow-requests-time-ms': logSlowRequestsTimeMs },
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error configuring slow request log:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Clear the search cache
export async function clearCache() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.post(
            '/operations/cache/clear',
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error clearing cache:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get debug info (state + version)
export async function getDebugInfo() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.get('/debug');
        return {
            success: true,
            data: response as DebugInfo,
        };
    } catch (error) {
        console.error('Error getting debug info:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get API stats
export async function getApiStats() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.get(
            '/stats.json',
        );
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error getting API stats:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Get cluster health status
export async function getHealthStatus() {
    try {
        const typesenseClient = getTypesenseClient();
        const response = await (typesenseClient as any).apiCall.get('/health');
        return {
            success: true,
            data: response,
        };
    } catch (error) {
        console.error('Error getting health status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
