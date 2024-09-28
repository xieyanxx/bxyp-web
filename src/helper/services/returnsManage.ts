import { formatTime } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

export type RefundItems = {
  id: number;
  name: string;
  count: number; //退款数量
}[];

class ColumnReturn extends RecordItem {
  readonly id: number;
  readonly orderNo: string;
  readonly refundAmount: number; //退款金额
  readonly refundNo: string; //退货订单号
  readonly username: string;
  readonly products: RefundItems; //退货商品
  readonly phone: string;
  readonly createTime:string;
  constructor(data: any = {}) {
    super({
      name: data.operator,
      key: data.id,
      time: data.updateTime,
    });
    this.id = data.id;
    this.orderNo = data.orderNo;
    this.refundAmount = data.refundAmount / 100;
    this.refundNo = data.refundNo;
    this.username = data.username;
    this.products = data.products;
    this.phone = data.phone;
    this.createTime = formatTime(data.createTime);
  }
}

export default {
  // 退款列表
  returnsList: (data: {
    orderNo?: string;
    startTime?: number | null;
    endTime?: number | null;
    username?: string;
    phone?: string;
  }) =>
    request.listRes(
      request({
        url: '/mall/admin/goods/order/list-refund',
        method: 'POST',
        data,
      }),
      (_) => new ColumnReturn(_),
    ),
};

export { ColumnReturn };
