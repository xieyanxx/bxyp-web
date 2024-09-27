import { formatTime } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

class ColumnProduct extends RecordItem {
  readonly id: number;
  readonly name: string;
  readonly pic: string;
  readonly createTime: string;
  readonly online: boolean;
  readonly sellPrice: number;
  readonly unit: string;
  readonly categoryId: number;
  readonly categoryName: string;
  readonly buyPrice: number;
  readonly stock: number;
  get newBuyPrice() {
    return `${this.buyPrice} 元/${this.unit}`;
  }
  get newSellPrice() {
    return `${this.sellPrice} 元/${this.unit}`;
  }
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
    this.sellPrice = data.sellPrice / 100;
    this.unit = data.unit;
    this.categoryId = data.categoryId;
    this.categoryName = data.categoryName;
    this.buyPrice = data.buyPrice / 100;
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
        data,
      }),
      (_) => new ColumnProduct(_),
    ),
  //更新商品
  updateProduct: (data: {
    name: string;
    pic: string;
    online: boolean;
    sellPrice: number;
    buyPrice: number;
    unit: string;
    stock: number;
    categoryId: number;
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
