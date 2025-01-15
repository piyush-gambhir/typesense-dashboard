import { Client } from 'typesense';

const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST ?? 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT ?? '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? '',
  connectionTimeoutSeconds: 60,
});

export default typesenseClient;
