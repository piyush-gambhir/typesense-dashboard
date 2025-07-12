export const env = {
  NODE_ENV: process.env.NODE_ENV as 'development' | 'test' | 'production',
  TYPESENSE_HOST: process.env.TYPESENSE_HOST!,
  TYPESENSE_PORT: process.env.TYPESENSE_PORT!,
  TYPESENSE_PROTOCOL: process.env.TYPESENSE_PROTOCOL!,
  TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
};
