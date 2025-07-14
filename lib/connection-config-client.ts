'use client';

import { TypesenseConnectionConfig } from './connection-config';

const COOKIE_NAME = 'typesense-connection-config';
const COOKIE_MAX_AGE = 14 * 24 * 60 * 60; // 14 days in seconds

export function getConnectionConfigClient(): TypesenseConnectionConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  const configCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${COOKIE_NAME}=`)
  );

  if (configCookie) {
    try {
      const value = configCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(value)) as TypesenseConnectionConfig;
    } catch (error) {
      console.error('Failed to parse connection config from cookie:', error);
    }
  }

  return null;
}

export function setConnectionConfigClient(config: TypesenseConnectionConfig) {
  if (typeof window === 'undefined') {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
  
  const cookieValue = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(config))}; expires=${expires.toUTCString()}; path=/; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
  
  document.cookie = cookieValue;
}

export function clearConnectionConfigClient() {
  if (typeof window === 'undefined') {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}