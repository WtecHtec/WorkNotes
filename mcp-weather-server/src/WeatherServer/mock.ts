import { WeatherData } from "./type.js";


export const weatherData: { [id: string]: WeatherData } = {
    "beijing": {
      location: "北京",
      temperature: 25,
      condition: "晴朗",
      humidity: 45,
      windSpeed: 10,
      forecast: "未来三天天气晴朗，气温在22-28度之间"
    },
    "shanghai": {
      location: "上海",
      temperature: 28,
      condition: "多云",
      humidity: 65,
      windSpeed: 15,
      forecast: "未来三天多云转阴，有小雨，气温在24-30度之间"
    },
    "guangzhou": {
      location: "广州",
      temperature: 32,
      condition: "雷阵雨",
      humidity: 80,
      windSpeed: 12,
      forecast: "未来三天有雷阵雨，气温在28-34度之间"
    }
  };