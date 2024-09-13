import { formatTime } from '@/utils';
import { request } from './request';
import { RecordItem } from './utils';

class ColumnCategory extends RecordItem {
  readonly id: number;
  readonly name: string;
  readonly pic: string;
  readonly createTime: string;
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
  }
}

export default {
  // 商品类别
  categoryList: (data: PagingParams<{ name?: string }>) =>
    request.listRes(
      request({
        url: '/mall/admin/goods/category/list',
        method: 'POST',
        data,
      }),
      (_) => new ColumnCategory(_),
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
};

export { ColumnCategory };
