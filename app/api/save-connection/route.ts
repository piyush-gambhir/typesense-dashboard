import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { resetTypesenseClient } from '@/lib/typesense/typesense-client';

const connectionSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  protocol: z.enum(['http', 'https']),
  apiKey: z.string().min(1),
});

const COOKIE_NAME = 'typesense-connection-config';
const COOKIE_MAX_AGE = 14 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = connectionSchema.parse(body);


    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(config), {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });


    resetTypesenseClient();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save connection config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save connection configuration' },
      { status: 400 }
    );
  }
}