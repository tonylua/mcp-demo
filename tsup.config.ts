import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  noExternal: [/^@modelcontextprotocol\//, "zod", "sqlite3", "util"],
  external: [],
});
