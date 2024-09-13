import ConfirmButton from '@/components/ConfirmButton';
import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import orderManage, { ColumnOrder } from '@/helper/services/orderManage';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import dayjs from 'dayjs';
import { memo, useCallback, useRef } from 'react';
import Refund from './Refund';

//商品管理
function OrderManage() {
  const tableRef = useRef<ActionType>();
  const columns = parseColumns<ColumnOrder>({
    columns: [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        hideInSearch: false,
      },
      {
        title: '商品信息',
        dataIndex: 'nickname',
        render: (_: any, data: ColumnOrder) => (
          <>
            {data.orderItems.map((item, index) => (
              <div key={index}>
                <div>{item.productName}</div>
                <div>X{item.productCount}</div>
                <div>{item.sellPrice}</div>
              </div>
            ))}
            <div></div>
          </>
        ),
      },
      {
        title: '售价',
        dataIndex: 'totalPrice',
      },
      {
        title: '成本价',
        dataIndex: 'totalBuyPrice',
      },
      {
        title: '下单用户',
        dataIndex: 'username',
        hideInSearch: false,
      },
      {
        title: '用户电话',
        dataIndex: 'phone',
        hideInSearch: false,
      },
      {
        title: '下单时间',
        dataIndex: 'createTime',
        hideInSearch: false,
        hideInTable: true,
        valueType: 'dateTimeRange',
        render: (_: any, data: ColumnOrder) => data.createTime,
        fieldProps: {
          placeholder: ['起始时间', '结束时间'],
        },
      },
    ],
    operation: {
      render: (_, data) => (
        <>
          <ConfirmButton
            title="确定要将该订单状态改为已完成吗？"
            onConfirm={() =>
              orderManage
                .updateStatus({ orderNo: data.orderNo })
                .then((res) => (res && reload(), res))
            }
          >
            已完成
          </ConfirmButton>
          <Refund raw={data} reload={reload} />
        </>
      ),
    },
  });
  const request = useCallback(
    (
      params: PagingArgs<{
        username?: string;
        orderNo?: string;
        createTime?: [string, string];
        phone?: string;
      }>,
    ) => {
      const {
        pageSize: size = 20,
        current: page = 1,
        username,
        orderNo,
        createTime,
        phone,
      } = params;
      const data = {
        pageNumber: page - 1,
        pageSize:size,
        orderNo: orderNo,
        startTime: createTime ? dayjs(createTime[0]).valueOf() : null,
        endTime: createTime ? dayjs(createTime[1]).valueOf() : null,
        username,
        phone,
      };
      return orderManage.orderList(data);
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
      <ProTable<ColumnOrder>
        actionRef={tableRef}
        columns={columns}
        request={request}
        toolBarRender={() => [<Refund reload={reload} />]}
      />
    </PageContainer>
  );
}

export default memo(OrderManage);
