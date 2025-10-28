import request from '@/utils/request';
import { Response, PageResult } from '../baseTypes';
import {
  IIntelligencePriceContent,
  IIntelligencePriceItem,
  IIntelligencePricePageParams,
} from './types';

class IntelligencePriceAPI {
  static async getIntelligencePricePage(params: IIntelligencePricePageParams) {
    return request<Response<PageResult<IIntelligencePriceItem>>>({
      url: '/hotelds-api/intelligence_price/page',
      method: 'POST',
      data: params,
      baseURL: `${import.meta.env.VITE_BASE_URL}`,
    });
  }

  static async getIntelligencePriceContent(id: number) {
    return request<Response<IIntelligencePriceContent>>({
      url: `/hotelds-api/intelligence_price/content/${id}`,
      method: 'GET',
      baseURL: `${import.meta.env.VITE_BASE_URL}`,
    });
  }
}

export default IntelligencePriceAPI;
