import { env } from '@/env';

import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: "localhost",
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
});

export default typesenseClient;
