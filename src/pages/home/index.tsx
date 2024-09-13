
import { Empty } from 'antd';
import React from 'react';

export default React.memo(() => {

  return (
    <div
      style={{
        height: '90vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Empty />
      {/* <UploadImages maxCount={3}></UploadImages> */}
    </div>
  );
});
