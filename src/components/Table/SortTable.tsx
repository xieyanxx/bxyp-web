import { useGetProp } from '@/hooks';
import { MenuOutlined } from '@ant-design/icons';
import { useGetState } from 'ahooks';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { arrayMoveImmutable } from 'array-move';
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import type { SortEnd, SortableContainerProps } from 'react-sortable-hoc';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
)) as any;
/**
 * @description: 必须添加zIndex样式
 */
const SortableItem = SortableElement(
  (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr {...props} style={{ zIndex: 1010 }} />
  ),
) as any;
const SortableBody = SortableContainer(
  (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
) as any;

export function creatSortColumns<
  T extends Record<string, any> = Record<string, any>,
>(columns: ColumnsType<T>) {
  return [
    {
      title: '排序',
      width: 80,
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    ...columns,
  ];
}
export type SortTableRefType<T> = { getDatas: () => T[] };
export type SortTableProps<
  T extends Record<string, any> = Record<string, any>,
> = {
  dataSource?: T[];
  /**
   * @description: 和trigger搭配
   */
  request?: () => Promise<T[]>;
  /**
   * @description: 显示时触发request
   */
  visible?: boolean;
  columns: ColumnsType<T>;
  onSortEnd?: (data: T[]) => void;
};
function formatData<T>(data: T[] = []) {
  return data?.map((v, i) => ({ ...v, __index: i }));
}

/**
 * @description: 抓手拖拽排序列表
 * ! 要么传dataSource，要么传visible和request
 * 拖拽是要显示记得加className: 'drag-visible'
 * ! dataSource会被处理：加上indexKey属性
 * ! 会给item加上__index属性，onSortEnd时会过滤
 */
function SortTable<T extends Record<string, any> = Record<string, any>>(
  { dataSource, request, visible, columns, onSortEnd }: SortTableProps<T>,
  ref: React.RefObject<SortTableRefType<T>>,
) {
  const requestRef = useGetProp(request);
  const dataSourceRef = useGetProp(dataSource);
  const onSortEndRef = useGetProp(onSortEnd);
  const [datas, setDatas, getDatas] = useGetState<(T & { __index: number })[]>(
    formatData(dataSource),
  );
  const [loading, setLoading] = useState(false);
  useImperativeHandle(ref, () => ({ getDatas }), []);
  useEffect(() => {
    if (visible && requestRef() && !dataSourceRef()) {
      setLoading(true);
      requestRef()()
        .then((res) => setDatas(formatData(res)))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible]);
  const handleSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(
        getDatas().slice(),
        oldIndex,
        newIndex,
      ).filter((el: T) => !!el);
      setDatas(newData);
    }
  };
  useEffect(() => {
    onSortEndRef()?.(datas.map(({ __index, ...rest }) => rest as any));
  }, [datas]);

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={handleSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> =
    useMemo(
      () =>
        ({ className, style, ...restProps }) => {
          const index = getDatas().findIndex(
            (x) => x.__index === restProps['data-row-key'],
          );
          return <SortableItem index={index} {...restProps} />;
        },
      [],
    );

  return (
    <Table<T>
      pagination={false}
      dataSource={datas}
      columns={columns}
      rowKey="__index"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
      loading={loading}
    />
  );
}

export default memo(forwardRef(SortTable)) as <
  T extends Record<string, any> = Record<string, any>,
>(
  props: SortTableProps<T> & { ref?: React.Ref<SortTableRefType<T>> },
) => React.ReactElement;
