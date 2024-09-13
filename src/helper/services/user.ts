import { formatTime } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

class ColumnUser extends RecordItem {
  readonly id: number;
  readonly username: string;
  readonly balance: number;
  readonly phone: string;
  readonly shopName: string;
  readonly shopAddr: string;
  readonly enabled: boolean;
  readonly createTime: string;
  readonly debtLimit: number; //欠款额度
  readonly debtBalance: number; //欠款余额
  get isUse() {
    return this.enabled ? '是' : '否';
  }
  constructor(data: any = {}) {
    super({
      name: data.operator,
      key: data.id,
      time: data.updateTime,
    });
    this.id = data.id;
    this.phone = data.phone;
    this.username = data.username;
    this.createTime = formatTime(data.createTime);
    this.balance = data.balance / 100 || 0;
    this.shopName = data.shopName;
    this.shopAddr = data.shopAddr;
    this.enabled = data.enabled;
    this.debtLimit = data.debtLimit / 100 || 0;
    this.debtBalance = data.debtBalance / 100 || 0;
  }
}

export default {
  // 用户列表
  userList: (data: any) =>
    request.listRes(
      request({
        url: '/mall/admin/user/list-user',
        method: 'POST',
        data: data,
      }),
      (_) => new ColumnUser(_),
    ),
  //更新用户
  updateUser: (data: any) =>
    request.successRes(
      request({
        url: '/mall/admin/user/add-user',
        method: 'POST',
        data,
      }),
    ),
  //用户充值
  recharge: (data: { userId: number | string; chargeAmount: number }) =>
    request.successRes(
      request({
        url: '/mall/admin/user/charge',
        method: 'POST',
        data,
      }),
    ),
  //修改密码
  changePwd: (data: { userId: number | string; password: string }) =>
    request.successRes(
      request({
        url: '/mall/admin/user/update-password',
        method: 'POST',
        data,
      }),
    ),
};

export { ColumnUser };
