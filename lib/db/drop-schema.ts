// DONT USE IN PRODUCTION
import { db } from "./drizzle";

async function clearData() {
  try {
    await db.execute(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);
    console.log("All tables dropped successfully.");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    process.exit();
  }
}

clearData();