import { Db, MongoClient } from 'mongodb';

const uri: string = process.env.MONGODB_URI as string;
const dbName: string = process.env.MONGODB_DB as string;

if (!uri || !dbName) {
  throw new Error(
    'Please define the MONGODB_URI and MONGODB_DB environment variables inside .env',
  );
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return db;
}

export const db: Promise<Db> = connectToDatabase();
