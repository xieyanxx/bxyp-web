import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import capitalFlow, {
  CashoutType,
  ColumnCashout,
} from '@/helper/services/capitalFlow';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import dayjs from 'dayjs';
import { memo, useCallback, useRef } from 'react';

//资金流水
function CapitalFlow() {
  const tableRef = useRef<ActionType>();
  const columns = parseColumns<ColumnCashout>({
    columns: [
      {
        title: '类型',
        dataIndex: 'type',
        hideInSearch: false,
        valueEnum: CashoutType,
      },
      {
        title: '金额',
        dataIndex: 'nickname',
        render: (_: any, data: ColumnCashout) => {
          return data.income ? (
            <div style={{ color: 'red' }}>+{data.amount}</div>
          ) : (
            <div>-{data.amount}</div>
          );
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        ellipsis: true,
        hideInSearch: false,
        valueType: 'dateRange',
        render: (_: any, data: any) => data.createTime,
        fieldProps: {
          placeholder: ['起始时间', '结束时间'],
        },
      },
    ],
    operation: false,
  });
  const request = useCallback(
    (
      params: PagingArgs<{
        type?: number;
        createTime?: [string, string];
        username?: string;
        phone?: string;
      }>,
    ) => {
      const {
        pageSize: size = 20,
        current: page = 1,
        type,
        username,
        phone,
        createTime,
      } = params;

      const data = {
        pageNumber: page - 1,
        pageSize:size,
        type,
        username,
        phone,
        startTime: createTime
          ? dayjs(createTime[0] + '00:00:00').valueOf()
          : null,
        endTime: createTime
          ? dayjs(createTime[1] + '23:59:59').valueOf()
          : null,
      };
      return capitalFlow.cashoutList(data);
    },
    [],
  );
  const reload = useCallback((reloadAndRest: boolean = true) => {
    reloadAndRest
      ? tableRef.current?.reloadAndRest?.()
      : tableRef.current?.reload();
  }, []);
  return (
    <PageContainer title={false}>
      <ProTable<ColumnCashout>
        actionRef={tableRef}
        columns={columns}
        request={request}
        toolBarRender={() => [
          //   <Add key="add" reload={reload} />,
        ]}
      />
    </PageContainer>
  );
}

export default memo(CapitalFlow);
