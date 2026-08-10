/**
 * Gadget 模拟服务端
 * 这里定义一个简单的 "Gadget" 对象，模拟 Cloudflare OS 中的私有应用实例
 */

import { RpcTarget } from 'capnweb';

export interface GadgetAPI {
  getCount(): Promise<number>;
  increment(delta: number): Promise<number>;
  getMessage(): Promise<string>;
  setMessage(msg: string): Promise<void>;
}

/**
 * 简单的 Gadget 实现（服务端逻辑）
 */
export class SimpleGadget extends RpcTarget implements GadgetAPI {
  private count = 0;
  private message = '你好，这是我的 Gadget';

  async getCount(): Promise<number> {
    return this.count;
  }

  async increment(delta: number): Promise<number> {
    this.count += delta;
    return this.count;
  }

  async getMessage(): Promise<string> {
    return this.message;
  }

  async setMessage(msg: string): Promise<void> {
    this.message = msg;
  }
}
