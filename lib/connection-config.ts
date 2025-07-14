export interface TypesenseConnectionConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  apiKey: string;
}

export function getConnectionConfigFromEnv(): TypesenseConnectionConfig | null {
  const envConfig = {
    host: process.env.TYPESENSE_HOST,
    port: process.env.TYPESENSE_PORT,
    protocol: process.env.TYPESENSE_PROTOCOL as 'http' | 'https',
    apiKey: process.env.TYPESENSE_API_KEY,
  };

  // If all env vars are present, use them
  if (envConfig.host && envConfig.port && envConfig.protocol && envConfig.apiKey) {
    return {
      host: envConfig.host,
      port: parseInt(envConfig.port),
      protocol: envConfig.protocol,
      apiKey: envConfig.apiKey,
    };
  }

  return null;
}

export function hasEnvConnectionConfig(): boolean {
  return !!(
    process.env.TYPESENSE_HOST &&
    process.env.TYPESENSE_PORT &&
    process.env.TYPESENSE_PROTOCOL &&
    process.env.TYPESENSE_API_KEY
  );
}

export function getDefaultConnectionConfig(): TypesenseConnectionConfig {
  return {
    host: 'localhost',
    port: 8108,
    protocol: 'http',
    apiKey: 'xyz',
  };
}