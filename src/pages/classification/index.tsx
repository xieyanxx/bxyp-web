import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import classification, {
  ColumnCategory,
} from '@/helper/services/classification';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { memo, useCallback, useRef } from 'react';
import Add from './Add';

//分类管理
function Classification() {
  const tableRef = useRef<ActionType>();
  const columns = parseColumns<ColumnCategory>({
    columns: [
      {
        title: '类别名',
        dataIndex: 'name',
        hideInSearch: false,
      },
      {
        title: '图片',
        dataIndex: 'pic',
        width: 120,
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
  const request = useCallback((params: PagingArgs<{ name?: string }>) => {
    const { pageSize: size = 20, current: page = 1, name } = params;
    const data = {
      pageNumber: page - 1,
      pageSize: size,
      name: name || '',
    };
    return classification.categoryList(data);
  }, []);
  const reload = useCallback((reloadAndRest: boolean = true) => {
    reloadAndRest
      ? tableRef.current?.reloadAndRest?.()
      : tableRef.current?.reload();
  }, []);
  return (
    <PageContainer title={false}>
      <ProTable<ColumnCategory>
        actionRef={tableRef}
        columns={columns}
        request={request}
        toolBarRender={() => [<Add key="add" reload={reload} />]}
      />
    </PageContainer>
  );
}

export default memo(Classification);
