import ProTable, { ProTableProps } from '@ant-design/pro-table';
import React from 'react';

const DefaultPaginationProps: any = {
  size: 'default',
  showTotal: undefined,
};

type PageProTableProps<T = any, U = any> = ProTableProps<T, U>;

const PageProTable: React.FC<PageProTableProps> = React.memo((props) => {
  const { pagination } = props;

  return (
    <ProTable
      size="large"
      {...props}
      pagination={{ ...pagination, ...DefaultPaginationProps }}
    />
  );
});

export default PageProTable;
