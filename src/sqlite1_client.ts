import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

const serverFile = path.resolve(__dirname, "sqlite1_server.ts");

export async function initClient() {
  const client = new Client(
    {
      name: "SQLite Explorer Client",
      version: "0.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {
          schema: ["schema://main"],
        },
        tools: {
          query: {
            arguments: {
              sql: "string",
            },
          },
          insert: {
            arguments: {
              table: "string",
              values: "object",
            },
          },
        },
      },
    }
  );

  // https://mcpserver.cloud/server/mcp-sqlite-server
  const transport = new StdioClientTransport({
    command: "ts-node",
    args: [serverFile],
  });

  await client.connect(transport);

  // console.log("Connected to server", serverFile, transport);

  // 查询数据库schema
  const schema = await client.readResource({
    uri: "schema://main",
  });
  console.log("1. Database Schema:", schema);

  // 执行SQL查询
  const queryResult = await client.callTool({
    name: "query",
    arguments: {
      sql: "SELECT * FROM sqlite_master WHERE type='table'",
    },
  });
  console.log("2. Query Result:", queryResult);

  // 执行数据插入
  const insertResult = await client.callTool({
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
