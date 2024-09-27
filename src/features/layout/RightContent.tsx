import {
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, } from '@umijs/max';
import { Avatar, Dropdown, MenuProps, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';
import Token from '@/helper/store/token';

const RightContent: React.FC = () => {
  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: (
        <div
          onClick={() => {
            localStorage.clear()
            history.replace('/login');
          }}
        >
          退出登录
        </div>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Space className={classNames(styles.right, styles.dark)}>
      <Dropdown menu={{ items }} placement="bottom">
        <div>
          <Avatar size="large" icon={<UserOutlined />} />
        </div>
      </Dropdown>
    </Space>
  );
};
export default RightContent;
