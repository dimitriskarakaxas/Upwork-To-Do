import { MongoClient, type Collection, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "todoapp";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

// Reuse the client across hot reloads in dev to avoid exhausting connections.
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

const clientPromise =
  globalForMongo._mongoClientPromise ??
  (globalForMongo._mongoClientPromise = new MongoClient(uri).connect());

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
