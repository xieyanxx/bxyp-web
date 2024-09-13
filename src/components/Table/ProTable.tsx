import { parseColumns } from '@/features/parseColumns';
import type { ParamsType } from '@ant-design/pro-provider';
import type { ProTableProps } from '@ant-design/pro-table';
import AProTable from '@ant-design/pro-table';
import { Table } from 'antd';
import classNames from 'classnames';
import { useMemo } from 'react';
import styles from './index.less';

const TableAlertRender = ({ selectedRows, onCleanSelected }: any) => (
  <span>
    已选 {selectedRows.length} 项
    <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
      取消选择
    </a>
  </span>
);
const DefRowSelection = {
  selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
};

export type ExtralProTableProps<
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
> = {
  /**
   * @name 批量操作功能组件渲染
   * @description 快速配置表格批量操作：批量选择多选，取消选择、反选、全选
   */
  simpleBatchAction?: ProTableProps<
    DataType,
    Params,
    ValueType
  >['tableAlertOptionRender'];
};
/**
 * @description: 预设一些默认值
 * 遇到过pro-table有broken change：expandable、revalidateOnFocus，影响到业务了，所以再封装一层
 */
function ProTable<
  DataType extends Record<string, any>,
  Params extends ParamsType = ParamsType,
  ValueType = 'text',
>({
  rowKey,
  search,
  scroll,
  className,
  expandable,
  revalidateOnFocus,
  rowSelection,
  tableAlertRender,
  tableAlertOptionRender,
  simpleBatchAction,
  ...rest
}: ProTableProps<DataType, Params, ValueType> &
  ExtralProTableProps<DataType, Params, ValueType>) {
  const rs = useMemo(
    () =>
      rowSelection
        ? rowSelection
        : simpleBatchAction
        ? DefRowSelection
        : undefined,
    [rowSelection, simpleBatchAction],
  );
  const tar = useMemo(
    () =>
      tableAlertRender
        ? tableAlertRender
        : simpleBatchAction
        ? TableAlertRender
        : undefined,
    [tableAlertRender, simpleBatchAction],
  );
  return (
    <AProTable<DataType, Params, ValueType>
      rowKey={rowKey ?? 'id'}
      className={classNames(styles.pro_table, className?.split(' '))}
      // 曾经有版本默认加expandIcon
      expandable={{ expandIcon: () => null, ...expandable }}
      search={search === false ? false : { defaultCollapsed: false, ...search }}
      scroll={{ y: '65vh', scrollToFirstRowOnChange: true, ...scroll }}
      // 曾经有版本默认加了revalidateOnFocus导致BUG
      revalidateOnFocus={revalidateOnFocus ?? false}
      sticky
      rowSelection={rs}
      tableAlertRender={tar}
      tableAlertOptionRender={
        tableAlertOptionRender ? tableAlertOptionRender : simpleBatchAction
      }
      {...rest}
    />
  );
}

export { ProTable as default, parseColumns };
