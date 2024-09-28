import ProTable from '@/components/Table/ProTable';
import { parseColumns } from '@/features/parseColumns';
import user, { ColumnUser } from '@/helper/services/user';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { memo, useCallback, useRef } from 'react';
import Add from './Add';
import ChangePwd from './ChangePwd';
import Recharge from './Recharge';
import Token from '@/helper/store/token';

function UserList() {
  const tableRef = useRef<ActionType>();
  const columns = parseColumns<ColumnUser>({
    columns: [
      {
        title: '用户名',
        dataIndex: 'username',
        hideInSearch: false,
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        hideInSearch: false,
      },
      {
        title: '余额',
        dataIndex: 'balance',
      },
      {
        title: '欠款额度(元)',
        dataIndex: 'debtLimit',
      },
      {
        title: '欠款余额(元)',
        dataIndex: 'debtBalance',
      },
      {
        title: '已欠款(元)',
        dataIndex: 'debt',
      },
      {
        title: '是否可用',
        dataIndex: 'isUse',
      },
      {
        title: '店铺名称',
        dataIndex: 'shopName',
        hideInSearch: false,
      },
      {
        title: '店铺位置',
        dataIndex: 'shopAddr',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
    ],
    operation: {
      render: (_, data) => (
        <>
          <Add raw={data} key={'add'} reload={reload} />
          {Token.getUser().nickname ==='admin' && <>
            <Recharge raw={data} key="Recharge" reload={reload}></Recharge>
            <ChangePwd raw={data} key="ChangePwd" reload={reload}></ChangePwd>
          </>}


        </>
      ),
    },
  });
  const request = useCallback(
    (
      params: PagingArgs<{
        username?: string;
        shopName?: string;
        phone?: string;
      }>,
    ) => {
      const {
        pageSize: size = 20,
        current: page = 1,
        username,
        shopName,
        phone,
      } = params;
      const data = {
        pageNumber: page - 1,
        pageSize: size,
        username,
        shopName,
        phone,
      };
      return user.userList(data);
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
      <ProTable<ColumnUser>
        actionRef={tableRef}
        columns={columns}
        request={request}
        toolBarRender={() => [<Add key="addUser" reload={reload} />]}
      />
    </PageContainer>
  );
}

export default memo(UserList);
