import path from 'node:path';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import server from './server';
import {initClient} from './client';

const dbPath = path.resolve(__dirname, '../test.db');

// Initialize SQLite database
async function initializeDatabase(): Promise<Database> {
  const db = new sqlite3.Database(dbPath);

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS documents (\n" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT,\n" +
        "title TEXT NOT NULL,\n" +
        "content TEXT,\n" +
        "created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n" +
        ")", (err) => {
          if (err) reject(err);
          resolve(true);
        });
    });
  });

  return db;
}

// Example CRUD operations
async function main() {
  try {
    const db = await initializeDatabase();
    
    // Insert sample document
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO documents (title, content) VALUES (?, ?)",
        ["Demo Document", "This is a sample SQLite document"],
        function(err) {
          if (err) reject(err);
          console.log(`Inserted document with ID: ${this.lastID}`);
          resolve(true);
        });
    });

    // Query all documents
    const documents = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM documents", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    console.log('All documents:', documents?.length, "====index.ts====\n");
    
    // db.close();

    initClient()
  } catch (error) {
    console.error('Database error:', error);
  }
}

main();