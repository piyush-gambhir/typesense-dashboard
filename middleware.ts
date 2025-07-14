import { NextRequest, NextResponse } from 'next/server';

// Name of the http-only cookie that stores the Typesense connection details.
const COOKIE_NAME = 'typesense-connection-config';

interface ConnectionConfig {
    host: string;
    port: number;
    protocol: 'http' | 'https';
    apiKey: string;
}

function getConfigFromEnv(): ConnectionConfig | null {
    const {
        TYPESENSE_HOST,
        TYPESENSE_PORT,
        TYPESENSE_PROTOCOL,
        TYPESENSE_API_KEY,
    } = process.env;

    if (
        TYPESENSE_HOST &&
        TYPESENSE_PORT &&
        TYPESENSE_PROTOCOL &&
        TYPESENSE_API_KEY
    ) {
        return {
            host: TYPESENSE_HOST,
            port: parseInt(TYPESENSE_PORT, 10),
            protocol: TYPESENSE_PROTOCOL as 'http' | 'https',
            apiKey: TYPESENSE_API_KEY,
        };
    }

    return null;
}

function getConfigFromCookie(request: NextRequest): ConnectionConfig | null {
    const cookie = request.cookies.get(COOKIE_NAME);
    if (!cookie) return null;

    try {
        return JSON.parse(cookie.value) as ConnectionConfig;
    } catch {
        return null;
    }
}

async function canConnect(config: ConnectionConfig): Promise<boolean> {
    // Use the built-in fetch to query Typesense health endpoint.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    try {
        const url = `${config.protocol}://${config.host}:${config.port}/health`;
        const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
            next: { revalidate: 0 },
        }).catch(() => null);
        return !!res && res.ok;
    } catch {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Paths that should never be redirected by this middleware
    const exemptPaths = ['/_next', '/favicon', '/robots.txt', '/sitemap.xml'];

    if (exemptPaths.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Obtain connection configuration
    const envConfig = getConfigFromEnv();
    const cookieConfig = getConfigFromCookie(request);
    const config = envConfig || cookieConfig;

    const onSetupPage = pathname.startsWith('/setup');
    const onErrorPage = pathname.startsWith('/connection-error');

    if (!config) {
        // No connection details at all → always go to /setup (except when we are already there)
        if (!onSetupPage) {
            const url = new URL('/setup', request.url);
            return NextResponse.redirect(url);
        }

        // Already on /setup
        return NextResponse.next();
    }

    // We do have connection details, ensure we can connect
    const isReachable = await canConnect(config);

    if (!isReachable) {
        // Details are present, but server is not reachable
        if (!onErrorPage) {
            const url = new URL('/connection-error', request.url);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }
    if (pathname === '/') {
        const url = new URL('/metrics', request.url);
        return NextResponse.redirect(url);
    }
    // Connection is healthy
    if (onSetupPage || onErrorPage) {
        const url = new URL('/metrics', request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Apply to all routes except static assets inside /_next
export const config = {
    matcher: '/((?!api/|_next/).*)',
};
