import { TiggerModalProps, TriggerModal } from '@/components/Modal';
import {
  SortTable,
  SortTableProps,
  SortTableRefType,
  creatSortColumns,
} from '@/components/Table';
import { Button } from 'antd';
import { useCallback, useRef, useState } from 'react';

export type SortTableModalProps<T> = {
  size?: TiggerModalProps['size'];
  onFinish?: (data: T[]) => Promise<boolean>;
  modalProps?: Omit<
    TiggerModalProps,
    'trigger' | 'onVisibleChange' | 'size' | 'onOk'
  >;
} & SortTableProps<T>;

function SortTableModal<T>({
  size,
  modalProps,
  columns,
  onFinish,
  ...restTableProps
}: SortTableModalProps<T>) {
  const tableRef = useRef<SortTableRefType<T>>(null);
  const [visible, setVisible] = useState(false);
  const onVisibleChange = useCallback((visible: boolean) => {
    setVisible(visible);
  }, []);
  const cols = creatSortColumns(columns);
  const onOk = useCallback(
    async () => onFinish?.(tableRef.current?.getDatas() || []) || true,
    [onFinish],
  );
  return (
    <TriggerModal
      size={size}
      {...modalProps}
      trigger={<Button type="primary">排序</Button>}
      onVisibleChange={onVisibleChange}
      onOk={onOk}
    >
      <SortTable<T> visible={visible} columns={cols} {...restTableProps} />
    </TriggerModal>
  );
}

export default SortTableModal;
