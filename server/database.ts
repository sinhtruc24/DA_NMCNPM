import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Set up PostgreSQL connection
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

// For migrations and queries
export const migrationClient = postgres(connectionString, { max: 1 });
export const queryClient = postgres(connectionString);

// Initialize Drizzle with our schema
export const db = drizzle(queryClient, { schema });

// Function to run migrations
export async function runMigrations() {
  try {
    console.log("Running migrations...");
    // This will create/update the database tables based on your schema
    await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}