import { z } from 'zod';

export const typesenseConnectionSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z
    .string()
    .min(1, 'Port is required')
    .regex(/^\d+$/, 'Port must be a number'),
  protocol: z.enum(['http', 'https']),
  apiKey: z.string().min(1, 'API Key is required'),
});
