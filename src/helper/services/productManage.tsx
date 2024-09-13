import { formatTime } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

class ColumnProduct extends RecordItem {
  readonly id: number;
  readonly name: string;
  readonly pic: string;
  readonly createTime: string;
  readonly online: boolean;
  readonly sell_price: number;
  readonly unit: string;
  readonly category_id: number;
  readonly category_name: string;
  readonly buy_price: number;
  readonly stock: number;
  constructor(data: any = {}) {
    super({
      name: data.operator,
      key: data.id,
      time: data.updateTime,
    });
    this.id = data.id;
    this.name = data.name;
    this.pic = data.pic;
    this.createTime = formatTime(data.createTime);
    this.online = data.online;
    this.sell_price = data.sell_price / 100;
    this.unit = data.unit;
    this.category_id = data.category_id;
    this.category_name = data.category_name;
    this.buy_price = data.buy_price / 100;
    this.stock = data.stock;
  }
}

export default {
  // 商品列表
  productList: (data: { name?: string; online?: boolean }) =>
    request.listRes(
      request({
        url: '/mall/admin/goods/product/list',
        method: 'POST',
        params: data,
      }),
      (_) => new ColumnProduct(_),
    ),
  //更新商品
  updateProduct: (data: {
    name: string;
    pic: string;
    online: boolean;
    sell_price: number;
    buy_price: number;
    unit: string;
    stock: number;
    category_id: number;
  }) =>
    request.successRes(
      request({
        url: '/mall/admin/goods/product/add',
        method: 'POST',
        data,
      }),
    ),
};

export { ColumnProduct };
