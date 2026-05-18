import { MongoClient, type Collection, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "todoapp";

function maskUri(value: string | undefined): string {
  if (!value) return "<missing>";
  return value.replace(/(\/\/[^:]+:)([^@]+)(@)/, "$1***$3");
}

console.log("[mongodb] module init", {
  hasUri: Boolean(uri),
  uri: maskUri(uri),
  dbName,
  nodeVersion: process.version,
  openssl: process.versions.openssl,
  platform: process.platform,
  nodeEnv: process.env.NODE_ENV,
});

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

// Reuse the client across hot reloads in dev to avoid exhausting connections.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise =
  globalForMongo._mongoClientPromise ??
  (globalForMongo._mongoClientPromise = (async () => {
    console.log("[mongodb] connecting…");
    const t0 = Date.now();
    try {
      const client = await new MongoClient(uri).connect();
      console.log("[mongodb] connected", { ms: Date.now() - t0 });
      return client;
    } catch (err) {
      console.error("[mongodb] connect failed", {
        ms: Date.now() - t0,
        name: (err as Error).name,
        message: (err as Error).message,
        code: (err as { code?: unknown }).code,
        cause: (err as { cause?: unknown }).cause,
      });
      // Clear the cached promise so the next request can retry.
      delete globalForMongo._mongoClientPromise;
      throw err;
    }
  })());

export type TodoDoc = {
  text: string;
  completed: boolean;
  createdAt: Date;
};

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getTodos(): Promise<Collection<TodoDoc>> {
  const db = await getDb();
  return db.collection<TodoDoc>("todos");
}
