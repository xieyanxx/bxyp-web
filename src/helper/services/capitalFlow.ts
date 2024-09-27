import { formatTime, map2options } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

const CashoutType:any = {
  0: '下单',
  1: '退款',
  2: '充值',
};
const CashoutTypeOptions = map2options(CashoutType, true);

class ColumnCashout extends RecordItem {
  readonly id: number;
  readonly amount: number;
  readonly income: boolean; //是否是收入
  readonly type: number; //订单成本价
  readonly createTime: string;
  readonly username: string;
  readonly phone: string;
  constructor(data: any = {}) {
    super({
      name: data.operator,
      key: data.id,
      time: data.updateTime,
    });
    this.id = data.id;
    this.amount = data.amount / 100;
    this.income = data.income;
    this.type = data.type;
    this.createTime = formatTime(data.createTime);
    this.username = data.username;
    this.phone = data.phone;
  }
}

export default {
  // 资金流水列表
  cashoutList: (data: {
    type?: number;
    startTime?: number | null;
    endTime?: number | null;
    username?: string;
    phone?: string;
  }) =>
    request.listRes(
      request({
        url: '/mall/admin/cash/list-log',
        method: 'POST',
        data,
      }),
      (_) => new ColumnCashout(_),
    ),
};

export { ColumnCashout, CashoutType };
