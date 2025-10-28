// 历史列表接口参数
export interface IIntelligencePricePageParams {
  hotel_code: string; // 酒店编码 必填
  current: number; // 当前页
  page_size: number; // 页大小
}

// 历史列表项
export interface IIntelligencePriceItem {
  id: number;
  publish_time: string;
}

// 推送内容接口响应
export interface IIntelligencePriceContent {
  dates: string[];
  lunar: string[];
  week: string[];
  intelligence_price_info: IIntelligencePriceInfo[];
  recommendation_content?: IRecommendationContent;
}

// 智能定价信息
export interface IIntelligencePriceInfo {
  competitor_hotel_short_name: string;
  current_hotel: boolean;
  current_price: number[];
  previous_price: number[];
  full_room: number[];
}

// 推荐内容
export interface IRecommendationContent {
  recommended_prices: number[];
  adjustment_reasons: string[];
}
