import path from "node:path";
import sqlite3 from "sqlite3";
import { Database } from "sqlite3";
// import { createServer } from './sqlite1_server';
// import { initClient } from './sqlite1_client';
import config from "./config.json";
import { MCPOptions, TransportOptions } from "./types";
import { MCPManagerSingleton } from "./mcp";

const dbPath = path.resolve(__dirname, "../test.db");

// Initialize SQLite database
async function initializeDatabase(): Promise<Database> {
  const db = new sqlite3.Database(dbPath);

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        "CREATE TABLE IF NOT EXISTS documents (\n" +
          "id INTEGER PRIMARY KEY AUTOINCREMENT,\n" +
          "title TEXT NOT NULL,\n" +
          "content TEXT,\n" +
          "created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n" +
          ")",
        (err) => {
          if (err) reject(err);
          resolve(true);
        }
      );
    });
  });

  return db;
}

async function prepareDatabase() {
  try {
    const db = await initializeDatabase();
    // Insert sample document
    // await new Promise((resolve, reject) => {
    //   db.run("INSERT INTO documents (title, content) VALUES (?, ?)",
    //     ["Demo Document", "This is a sample SQLite document"],
    //     function(err) {
    //       if (err) reject(err);
    //       console.log(`Inserted document with ID: ${this.lastID}`);
    //       resolve(true);
    //     });
    // });

    // Query all documents
    const documents = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM documents", (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    console.log("All documents:", documents?.length, "====index.ts====\n");

    db.close();
  } catch (error) {
    console.error("Database error:", error);
  }
}

// Example CRUD operations
async function main() {
  await prepareDatabase();
  //   initClient()

  const mcpServers: MCPOptions[] = Object.entries(
    config.mcpServers as Record<string, TransportOptions>
  ).map(([key, mcpServer], index) => ({
    id: `mcpserver-${key}-${index}`,
    name: "mcp server",
    transport: {
      ...mcpServer,
    },
  }));

  const mcpManager = MCPManagerSingleton.getInstance();
  mcpManager.setConnections(mcpServers, false);

  const conn1 =
    MCPManagerSingleton.getInstance().getConnection("mcpserver-sqlite-0");
  if (conn1?.client) {
    const client1 = conn1.client;
    // 查询数据库schema
    const schema = await client1.readResource({
      uri: "schema://main",
    });
    console.log("1. Database Schema:", schema);
    // 执行SQL查询
    const queryResult = await client1.callTool({
      name: "query",
      arguments: {
        sql: "SELECT * FROM sqlite_master WHERE type='table'",
      },
    });
    console.log("2. Query Result:", queryResult);
    // 执行数据插入
    const insertResult = await client1.callTool({
      name: "insert",
      arguments: {
        table: "documents",
        values: {
          title: "Docccc" + Math.random(),
          content: "Contentttt" + Math.random(),
        },
      },
    });
    console.log("3. Insert Result:", insertResult);
  }
}

main();
