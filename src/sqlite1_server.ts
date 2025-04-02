import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import path from "path";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import { z } from "zod";

const dbPath = path.join(__dirname, "../test.db");

// Helper to create DB connection
const getDb = (path?: string) => {
  const db = new sqlite3.Database(path || dbPath);
  console.log("GET_DB", db);
  return {
    all: promisify(db.all.bind(db)),
    run: promisify(db.run.bind(db)),
    close: promisify(db.close.bind(db)),
  };
};

export function createServer() {
  const server = new McpServer({
    name: "SQLite Explorer",
    version: "1.0.0",
  });

  server.resource("schema", "schema://main", async (uri: any, extra?: any) => {
    const db = getDb(extra.db_path);
    try {
      const tables = (await db.all(
        "SELECT sql FROM sqlite_master WHERE type='table'"
      )) as unknown[];
      return {
        contents: [
          {
            uri: uri.href,
            text: tables.map((t) => (t as any).sql).join("\n"),
          },
        ],
      };
    } finally {
      await db.close();
    }
  });

  server.tool(
    "query",
    { sql: z.string(), db_path: z.optional(z.string()) },
    async ({ sql, db_path }) => {
      const db = getDb(db_path);
      try {
        const results = await db.all(sql);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (err) {
        const error = err as Error;
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      } finally {
        await db.close();
      }
    }
  );

  server.tool(
    "insert",
    {
      db_path: z.optional(z.string()),
      table: z.string(),
      values: z.record(z.string(), z.unknown()),
    },
    async ({ db_path, table, values }) => {
      const db = getDb(db_path);
      try {
        const columns = Object.keys(values).join(", ");
        const placeholders = Object.keys(values)
          .map((key) => `"${values[key]}"`)
          .join(", ");
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        await db.run(sql);
        return {
          content: [
            {
              type: "text",
              text: `Successfully inserted into ${table}`,
            },
          ],
        };
      } catch (err) {
        const error = err as Error;
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      } finally {
        await db.close();
      }
    }
  );

  const transport = new StdioServerTransport();
  server.connect(transport);
}

createServer();
