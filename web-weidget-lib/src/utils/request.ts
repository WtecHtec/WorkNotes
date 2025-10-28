import axios, { AxiosRequestConfig } from 'axios';
import { Toast } from 'antd-mobile';

/** 真实请求的路径前缀 */
const service = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 15000,
});
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    if (config.headers?.source) {
      return config;
    }
    Object.assign(config.headers, {});
    return config;
  },
  (error) => {
    Promise.resolve(error);
  }
);

// 请求响应器
service.interceptors.response.use(
  (response) => {
    const { data, config } = response;
    switch (data.code) {
      case '1':
      case '200':
      case 'success':
        data.code = 200;
        break;
      case 'AUTH-INVALID-001':
      case 'AUTH-REFRESH-INVALID':
      case 'token无效':
      case 'AUTH-TOKEN-INVALID':
      case '401':
        if (config.url?.includes('/api/login/refreshToken')) {
          data.code = 401;
          Toast.show('登录失效');
          return data;
        }
        return data;
      default:
      // Toast.show(data?.msg || data?.message || data?.errorDesc || "服务器错误！");
    }
    return data;
  },
  (error) => {
    // 处理 422 或者 500 的错误异常提示
    const errMsg = error?.response?.data?.message;
    errMsg && Toast.show(errMsg);
    error.message = errMsg;
    return Promise.resolve(error);
  }
);

const getRequestHeaders = (options: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options,
  };
  return headers;
};

export default async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  // @ts-ignore
  return service({
    ...config,
    headers: getRequestHeaders(config.headers),
  })
    .then((res) => {
      return Promise.resolve(res);
    })
    .catch((err) => {
      return Promise.resolve(err);
    });
};

// 判断请求是否成功
export const isSuccess = (code: string | number) => code === 200;

// 判断请求是否失败
export const isFailReq = (code: string | number) => code !== 200;
