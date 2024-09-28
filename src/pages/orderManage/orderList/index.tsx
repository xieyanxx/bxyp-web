import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import orderManage, {
  ColumnOrder,
  OrderStatus,
} from '@/helper/services/orderManage';
import { handleAmount } from '@/helper/services/utils';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { Button, Popconfirm } from 'antd';
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
                <div>{`${item.productName}`}</div>
                <div>{`数量：${item.productCount}`}</div>
                <div>{`单价：${handleAmount(item.sellPrice)}元`}</div>
              </div>
            ))}
          </>
        ),
      },
      {
        title: '售价',
        dataIndex: 'totalPrice',
        render: (_: any, data: ColumnOrder) => <div>{data.totalPrice}元</div>,
      },
      {
        title: '成本价',
        dataIndex: 'totalBuyPrice',
        render: (_: any, data: ColumnOrder) => (
          <div>{data.totalBuyPrice}元</div>
        ),
      },
      {
        title: '订单状态',
        dataIndex: 'orderState',
        valueEnum: OrderStatus,
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
        valueType: 'dateTimeRange',
        render: (_: any, data: ColumnOrder) => data.createTime,
        fieldProps: {
          placeholder: ['起始时间', '结束时间'],
        },
      },
    ],
    operation: {
      render: (_, data) => (

        <div style={{display:'flex',alignItems:'center',flexWrap:"wrap",gap:"8px"}}>
           <Refund raw={data} reload={reload} />
          {data.orderState == 0 && (
            <Popconfirm
              title="确定要将该订单状态改为已完成吗？"
              onConfirm={() => {
                orderManage
                  .updateStatus({ orderNo: data.orderNo })
                  .then((res) => (res && reload(), res));
              }}
            >
              <Button>已完成</Button>
            </Popconfirm>
          )}


        </div>
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
        pageSize: size,
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
        toolBarRender={() => []}
      />
    </PageContainer>
  );
}

export default memo(OrderManage);
