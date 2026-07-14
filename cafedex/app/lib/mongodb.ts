import "server-only";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable.");
}
const uri: string = process.env.MONGODB_URI;

function createClientPromise(): Promise<MongoClient> {
  return new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect();
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export default function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV !== "development") {
    return createClientPromise();
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
    global._mongoClientPromise.catch(() => {
      global._mongoClientPromise = undefined;
    });
  }

  return global._mongoClientPromise;
}
