import { memo } from 'react';

import orderManage, { OrderStatus } from '@/helper/services/orderManage';
import { formatTime, writeXLSX } from '@/utils';
import { Button } from 'antd';

function ExportExcel({ params }: any) {
  const getData = async () => {
    orderManage.orderList({ ...params, pageSize: 1000 }).then((res) => {
      const data = res.data.reduce((pre: any[], cur, index) => {
        // excel序号从1开始， 表格第一行是标题
        pre.push({
          序号: index + 1,
          ID: cur.id,
          订单号: cur.orderNo,
          商品信息: `${cur.orderItems.map((item) => {
            let items = `${item.productName} X${item.productCount}`;
            return items;
          }).join('\n')}`,
          '售价(元)': cur.totalPrice,
          '成本价(元)': cur.totalBuyPrice,
          订单状态: OrderStatus[cur.orderState],
          下单用户: cur.username,
          用户电话: cur.phone,
          下单时间: formatTime(cur.createTime),
        });
        return pre;
      }, []);
      writeXLSX({
        filename: '下单记录.xlsx',
        sheets: [
          {
            data: data,
          },
        ],
      });
    });
  };

  return <Button onClick={getData}>导出</Button>;
}

export default memo(ExportExcel);
