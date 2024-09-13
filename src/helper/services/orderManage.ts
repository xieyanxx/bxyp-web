import { formatTime } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

export type OrderItems = {
  productId: number;
  productName: string;
  productCount: number; //商品数量
  price: number; //价格
  sellPrice: number; //售价
  buyPrice: number; //成本
  orderItemo: string; //订单号
  refundStatus: number; //有无退款1有退款、0无退款
  refundAmount: number; //退款金额
}[];
export type RefundItems = {
  refundItemNo: string;
  productName: string;
  refundCount: number; //退款数量
  refundAmount: string; //退款金额
  unint: string; //商品单位
  createTime: string;
}[];

class ColumnOrder extends RecordItem {
  readonly id: number;
  readonly orderNo: string;
  readonly totalPrice: number; //订单价格
  readonly totalBuyPrice: number; //订单成本价
  readonly createTime: string;
  readonly username: string;
  readonly orderItems: OrderItems; //下单商品
  readonly refundItems: RefundItems; //退货商品
  readonly phone: string;
  constructor(data: any = {}) {
    super({
      name: data.operator,
      key: data.id,
      time: data.updateTime,
    });
    this.id = data.id;
    this.orderNo = data.orderNo;
    this.totalPrice = data.totalPrice;
    this.totalBuyPrice = data.totalBuyPrice;
    this.username = data.username;
    this.orderItems = data.orderItems;
    this.refundItems = data.refundItems;
    this.phone = data.phone;
    this.createTime = formatTime(data.createTime);
  }
}

export default {
  // 订单列表
  orderList: (data: {
    orderNo?: string;
    startTime?: number | null;
    endTime?: number | null;
    username?: string;
    phone?: string;
  }) =>
    request.listRes(
      request({
        url: '/mall/admin/goods/order/list',
        method: 'POST',
        params: data,
      }),
      (_) => new ColumnOrder(_),
    ),
  //更新分类
  updateCategory: (data: { name: string; pic: string }) =>
    request.successRes(
      request({
        url: '/mall/admin/goods/category/add',
        method: 'POST',
        data,
      }),
    ),
  //更新订单状态
  updateStatus: (data: { orderNo: string }) =>
    request.successRes(
      request({
        url: '/mall/admin/goods/order/update',
        method: 'POST',
        data,
      }),
    ),
};

export { ColumnOrder };
