import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

interface NotFoundProps {
  newTitle?: string;
  newSubTitle?: string;
}

const NotFound: React.FC<NotFoundProps> = React.memo((props) => {
  const { newTitle, newSubTitle } = props;
  const [isExist, setIsExist] = useState<boolean>(true);
  const [routeName, setRouteName] = useState<any>('');

  return (
    <Result
      className={styles['result-wrapper']}
      status="404"
      title={newTitle || '404'}
      subTitle={newSubTitle || '对不起，您访问的页面不存在'}
      extra={
        <Button type="primary" onClick={() => history.push('/home')}>
          去公共看板
        </Button>
      }
    />
  );
});

export default NotFound;
