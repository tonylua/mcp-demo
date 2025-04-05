/**
 * A simple MCP echo server that repeats back whatever it is prompted for testing.
 * It implements a single tool that echoes back the input message.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Create an MCP server with capabilities for tools (to echo messages).
 */
const server = new McpServer({
  name: "echo-server",
  version: "1.0.0",
});

/**
 * Handler for the echo tool.
 * Simply returns the input message.
 */
server.tool("echo", { message: z.string() }, async ({ message }) => {
  console.log('server tool echo', message)
  try {
    const text = String(message || "");
    return {
      content: [
        {
          type: "text",
          text,
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
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Echo MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
