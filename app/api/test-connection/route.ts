import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'typesense';
import { z } from 'zod';

const connectionSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  protocol: z.enum(['http', 'https']),
  apiKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = connectionSchema.parse(body);

    // Create a temporary client with the provided configuration
    const testClient = new Client({
      nodes: [
        {
          host: config.host,
          port: config.port,
          protocol: config.protocol,
        },
      ],
      apiKey: config.apiKey,
      connectionTimeoutSeconds: 10,
    });

    // Test the connection by attempting to retrieve cluster health
    await testClient.health.retrieve();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Typesense server' },
      { status: 400 }
    );
  }
}