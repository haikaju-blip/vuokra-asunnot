import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_PATH = process.env.VUOKRA_DB_PATH || "/opt/vuokra-platform/data/vuokra.db";

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Re-export schema for convenience
export * from "./schema";
