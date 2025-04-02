export interface StdioOptions {
  type: "stdio";
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface WebSocketOptions {
  type: "websocket";
  url: string;
}

export interface SSEOptions {
  type: "sse";
  url: string;
}

export type TransportOptions = StdioOptions | WebSocketOptions | SSEOptions;

export interface MCPOptions {
  name: string;
  id: string;
  transport: TransportOptions;
  faviconUrl?: string;
  timeout?: number;
}

export type MCPConnectionStatus =
  | "connecting"
  | "connected"
  | "error"
  | "not-connected";

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: {
    name: string;
    description?: string;
    required?: boolean;
  }[];
}

export interface MCPResource {
  name: string;
  uri: string;
  description?: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, any>;
  };
}

export interface MCPServerStatus extends MCPOptions {
  status: MCPConnectionStatus;
  errors: string[];

  prompts: MCPPrompt[];
  tools: MCPTool[];
  resources: MCPResource[];
}
