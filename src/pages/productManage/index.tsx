import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { memo, useCallback, useRef } from 'react';
import Add from './Add';
import productManage, { ColumnProduct } from '@/helper/services/productManage';


//商品管理
function ProductManage() {
  const tableRef = useRef<ActionType>();
  const columns = parseColumns<ColumnProduct>({
    columns: [
      {
        title: '商品名称',
        dataIndex: 'name',
        hideInSearch: false,
      },
      {
        title: '所属类别',
        dataIndex: 'category_name',
        hideInSearch: false,
      },
      {
        title: '商品售价',
        dataIndex: 'sell_price',
      },
      {
        title: '商品进价',
        dataIndex: 'buyPrice',
      },
      {
        title: '是否上架',
        dataIndex: 'online',
        hideInSearch: false,
        valueEnum: { false: '否', true: '是' },
      },
      {
        title: '商品图',
        dataIndex: 'pic',
        // width: 120,
        valueType: 'image',
      },
    ],
    operation: {
      render: (_, data) => (
        <>
          <Add raw={data} reload={reload} />
        </>
      ),
    },
  });
  const request = useCallback(
    (params: PagingArgs<{ name?: string; online?: boolean }>) => {
      const { pageSize: size = 20, current: page = 1, name,online } = params;
      const data = {
        pageNumber: page - 1,
        pageSize:size,
        name,
        online,
      };
      return productManage.productList(data);
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
      <ProTable<ColumnProduct>
        actionRef={tableRef}
        columns={columns}
        request={request}
        toolBarRender={() => [
          <Add key="add" reload={reload} />,
        ]}
      />
    </PageContainer>
  );
}

export default memo(ProductManage);
