import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import productManage, { ColumnProduct } from '@/helper/services/productManage';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { Button, Popconfirm } from 'antd';
import { memo, useCallback, useRef } from 'react';
import Add from './Add';

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
        dataIndex: 'categoryName',
        hideInSearch: false,
      },
      {
        title: '商品售价',
        dataIndex: 'newSellPrice',
      },
      {
        title: '商品进价',
        dataIndex: 'newBuyPrice',
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
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
    ],
    operation: {
      render: (_, data) => (
        <>
          <Add raw={data} reload={reload} />
          <Popconfirm
            title={`确定要${data.online ? '下架' : '上架'}`}
            onConfirm={() => {
              const value = {
                name: data.name,
                pic: data.pic,
                unit: data.unit,
                stock: data.stock,
                categoryId: data.categoryId,
                sellPrice: data.sellPrice * 100,
                buyPrice: data.buyPrice * 100,
                online: !data.online,
                id:data.id
              };
              productManage.updateProduct(value).then((res) => {
                reload();
              });
            }}
          >
            <Button>{data.online ? '下架' : '上架'}</Button>
          </Popconfirm>
        </>
      ),
    },
  });
  const request = useCallback(
    (params: PagingArgs<{ name?: string; online?: boolean }>) => {
      const { pageSize: size = 20, current: page = 1, name, online } = params;
      const data = {
        pageNumber: page - 1,
        pageSize: size,
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
        toolBarRender={() => [<Add key="add" reload={reload} />]}
      />
    </PageContainer>
  );
}

export default memo(ProductManage);
