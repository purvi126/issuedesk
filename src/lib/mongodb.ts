import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

if (!uri) throw new Error("MONGODB_URI is not defined in .env.local");
if (!dbName) throw new Error("MONGODB_DB is not defined in .env.local");

// Attach to global in dev so hot reload doesn't spawn a new client on every save.
// In production, a fresh client is created per module load (Lambda/Edge lifecycle).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
    // connect() is idempotent — safe to call once here
    global._mongoClient.connect().catch(console.error);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(uri);
  client.connect().catch(console.error);
}

export async function getDb(): Promise<Db> {
  // connect() is a no-op if already connected
  await client.connect();
  return client.db(dbName);
}