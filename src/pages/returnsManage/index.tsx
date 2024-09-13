import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import returnsManage, { ColumnReturn } from '@/helper/services/returnsManage';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import dayjs from 'dayjs';
import { memo, useCallback, useRef } from 'react';

//退货管理
function ReturnsManage() {
  const tableRef = useRef<ActionType>();
  const columns = parseColumns<ColumnReturn>({
    columns: [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        hideInSearch: false,
      },
      {
        title: '退货订单号',
        dataIndex: 'refundNo',
      },
      {
        title: '退货商品',
        dataIndex: 'products',
        render: (_: any, data: ColumnReturn) => {
          return data.products.map((item) => (
            <div key={item.id}>{`${item.name}(X${item.count})`}</div>
          ));
        },
      },
      {
        title: '退货价格',
        dataIndex: 'refundAmount',
      },

      {
        title: '退货用户',
        dataIndex: 'username',
        hideInSearch: false,
      },
      {
        title: '用户电话',
        dataIndex: 'phone',
        hideInSearch: false,
      },
    ],
    operation: false,
  });
  const request = useCallback(
    (
      params: PagingArgs<{
        orderNo?: string;
        createTime?: [string, string];
        username?: string;
        phone?: string;
      }>,
    ) => {
      const {
        pageSize: size = 20,
        current: page = 1,
        orderNo,
        username,
        phone,
        createTime,
      } = params;

      const data = {
        pageNumber: page - 1,
        pageSize:size,
        orderNo,
        username,
        phone,
        startTime: createTime
          ? dayjs(createTime[0] + '00:00:00').valueOf()
          : null,
        endTime: createTime
          ? dayjs(createTime[1] + '23:59:59').valueOf()
          : null,
      };
      return returnsManage.returnsList(data);
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
      <ProTable<ColumnReturn>
        actionRef={tableRef}
        columns={columns}
        request={request}
        toolBarRender={() => []}
      />
    </PageContainer>
  );
}

export default memo(ReturnsManage);
