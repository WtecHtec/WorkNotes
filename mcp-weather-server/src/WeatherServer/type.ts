/**
 * 天气数据类型
 */
type WeatherData = {
    location: string,
    temperature: number,
    condition: string,
    humidity: number,
    windSpeed: number,
    forecast: string
};

export {
    WeatherData
}