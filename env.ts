import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   Specify your server-side environment variables schema here. This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    ENVIRONMENT: z.enum(['development', 'test', 'production']),
    TYPESENSE_HOST: z.string(),
    TYPESENSE_PORT: z.string(),
    TYPESENSE_PROTOCOL: z.string(),
    TYPESENSE_API_KEY: z.string(),
  },

  /**
   Specify your client-side environment variables schema here. This way you can ensure the app isn't built with invalid env vars. 
   To expose them to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ENVIRONMENT: process.env.ENVIRONMENT,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    TYPESENSE_HOST: process.env.TYPESENSE_HOST,
    TYPESENSE_PORT: process.env.TYPESENSE_PORT,
    TYPESENSE_PROTOCOL: process.env.TYPESENSE_PROTOCOL,
    TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
  },
  /**
   Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
