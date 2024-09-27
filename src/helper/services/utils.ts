import { formatTime, uuid } from '@/utils';

/**
 * table中每行数据都该有个 rowKey。不用id是因为有些时候后端隔得数据每项没有唯一值
 */
class ColmunItem {
  readonly rowKey: string | number;
  constructor(key?: string | number) {
    this.rowKey = key ?? uuid();
  }
}

/**
 * 处理了table数据的操作记录
 */
class RecordItem extends ColmunItem {
  readonly operator: string;
  readonly operationTime: string;
  constructor(data: {
    name: string;
    time?: string | number;
    key?: string | number;
  }) {
    super(data.key);
    this.operator = data.name ?? '-';
    this.operationTime = formatTime(data.time);
  }
}
const checkPrice = (_: any, value: { number: number }) => {
  if (value.number > 0) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('价格必须大于0'));
};

export { ColmunItem, RecordItem, checkPrice };

export const UnitOptions = [
  {
    label: '份',
    value: '份',
  },
  {
    label: 'kg',
    value: 'kg',
  },
  {
    label: '只',
    value: '只',
  },
  {
    label: '颗',
    value: '颗',
  },
  {
    label: '盒',
    value: '盒',
  },
];


/**
 *
 * @param amount 处理金额后端返回为分
 * @returns
 */
export function handleAmount(amount?: number) {
  return amount ? amount / 100 : 0
}