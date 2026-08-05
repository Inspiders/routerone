import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://routerone:routerone@localhost:5432/routerone";

const client = postgres(connectionString, { max: 20 });
export const db = drizzle(client, { schema });

export * from "./schema";
