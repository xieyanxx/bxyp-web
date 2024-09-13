import { memo, useMemo } from 'react';
import styles from './index.less';

export type OperationRecordProps = {
  format: () => { operationTime?: string; operator?: string };
};
/**
 * @description: 操作记录组件
 */
function OperationRecord({ format }: OperationRecordProps) {
  const data = useMemo(() => format(), [format]);
  return (
    <div className={styles.operation}>
      <p>{data.operator || DefText}</p>
      <p>{data.operationTime || DefText}</p>
    </div>
  );
}

export default memo(OperationRecord);
