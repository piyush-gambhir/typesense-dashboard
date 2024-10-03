import { env } from '@/env';
import Typesense from 'typesense';


const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: "xyz",
  connectionTimeoutSeconds: 2,
});

export default typesenseClient;

