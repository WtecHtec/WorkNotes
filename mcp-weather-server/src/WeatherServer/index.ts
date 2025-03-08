import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { weatherData } from "./mock.js";

class WeatherServer {
  private server: Server;
  constructor() {
    this.server = new Server(
      {
        name: "mcp-weather-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );
    this.setupHandlers();
  }
  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
    this.setupPromptHandlers();
  }


  private setupResourceHandlers(): void {
    // TODO: 实现资源处理器
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: Object.entries(weatherData).map(([id, data]) => ({
          uri: `weather:///${id}`,
          mimeType: "text/plain",
          name: `${data.location}天气`,
          description: `${data.location}的天气信息`
        }))
      };
    });

    /**
* 处理读取特定天气资源的请求
* 接收weather:// URI并返回天气数据
*/
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const url = new URL(request.params.uri);
      const id = url.pathname.replace(/^\//, '');
      const data = weatherData[id];

      if (!data) {
        throw new Error(`找不到${id}的天气数据`);
      }

      const weatherText = `
地点: ${data.location}
温度: ${data.temperature}°C
天气状况: ${data.condition}
湿度: ${data.humidity}%
风速: ${data.windSpeed}km/h
预报: ${data.forecast}
  `.trim();

      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "text/plain",
          text: weatherText
        }]
      };
    });
  }

  private setupToolHandlers(): void {
    // TODO: 实现工具处理器

    /**
 * 处理列出可用工具的请求
 * 提供一个"query_weather"工具，允许客户端查询特定地点的天气
 */
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "query_weather",
            description: "查询特定地点的天气信息",
            inputSchema: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "要查询天气的地点（如：beijing, shanghai, guangzhou）"
                }
              },
              required: ["location"]
            }
          }
        ]
      };
    });


    /**
 * 处理工具调用请求
 * 根据提供的地点查询天气信息
 */
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "query_weather": {
          const location = String(request.params.arguments?.location).toLowerCase();
          if (!location) {
            throw new Error("必须提供地点");
          }

          const data = weatherData[location];
          if (!data) {
            return {
              content: [{
                type: "text",
                text: `抱歉，没有找到${location}的天气信息。可用的地点有：${Object.keys(weatherData).join(', ')}`
              }]
            };
          }

          return {
            content: [{
              type: "text",
              text: `
${data.location}天气信息:
温度: ${data.temperature}°C
天气状况: ${data.condition}
湿度: ${data.humidity}%
风速: ${data.windSpeed}km/h
预报: ${data.forecast}
          `.trim()
            }]
          };
        }

        default:
          throw new Error("未知工具");
      }
    });

  }

  private setupPromptHandlers(): void {
    // TODO: 实现提示处理器

    /**
 * 处理列出可用提示的请求
 * 提供一个"analyze_weather"提示，用于分析天气数据
 */
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "analyze_weather",
            description: "分析所有地点的天气数据",
          }
        ]
      };
    });



    /**
     * 处理获取特定提示的请求
     * 返回一个请求分析所有天气数据的提示，并嵌入天气资源
     */
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name !== "analyze_weather") {
        throw new Error("未知提示");
      }

      const embeddedWeatherData = Object.entries(weatherData).map(([id, data]) => {
        const weatherText = `
地点: ${data.location}
温度: ${data.temperature}°C
天气状况: ${data.condition}
湿度: ${data.humidity}%
风速: ${data.windSpeed}km/h
预报: ${data.forecast}
    `.trim();

        return {
          type: "resource" as const,
          resource: {
            uri: `weather:///${id}`,
            mimeType: "text/plain",
            text: weatherText
          }
        };
      });

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "请分析以下地点的天气数据:"
            }
          },
          ...embeddedWeatherData.map(weather => ({
            role: "user" as const,
            content: weather
          })),
          {
            role: "user",
            content: {
              type: "text",
              text: "请提供一个简洁的天气分析，包括各地区天气对比和建议。"
            }
          }
        ]
      };
    });

  }
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

export default WeatherServer;