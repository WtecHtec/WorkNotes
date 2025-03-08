
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import WeatherServer from "./WeatherServer/index.js";
async function main() {
    new WeatherServer().run();
  }
  
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });