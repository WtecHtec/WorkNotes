// 只存放基础类型，不要存放接口类型

export interface Response<T> {
  code: number | string;
  msg: string;
  data: T;
  trace_id: string | null;
  success: boolean;
  success_with_data: boolean;
}

export interface PageResult<T> {
  total: number;
  data_list: T[];
}

export type AnyObject = Record<PropertyKey, any>;
