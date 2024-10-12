/** 订单商品汇总列表 */
import { memo } from 'react';
import orderManage, { OrderStatus } from '@/helper/services/orderManage';
import { formatTime, writeXLSX } from '@/utils';
import { Button } from 'antd';

function ExportExcel({ params }: any) {
  const getData = async () => {
    orderManage.orderList({ ...params, pageSize: 1000 }).then((res) => {

      /** 将所有下单并且待发货状态的数据转成一维数组 */
      const newData=res.data.map((item)=>{
        if(item.orderState==0){
          return item.orderItems
        }
      }).filter(item=>!!item && item.length).flat();

      /** 根据产品id分类 */
      const groupById = newData.reduce((acc:any, current:any) => {
        const existing:any = acc.find((a:any) => a.productId === current.productId);
        if (existing) {
          existing.items.push(current);
        } else {
          acc.push({ productId: current.productId, items: [current],productName:current.productName });
        }
        return acc;
      }, []);
      console.log(newData,groupById)
      const data = groupById.reduce((pre: any[], cur:any, index:number) => {
        // excel序号从1开始， 表格第一行是标题
        pre.push({
          序号: index + 1,
          商品ID: cur.productId,
          商品名称: cur.productName,
          商品数量: `${cur.items.map((item:any) => {
            let items = `(X${item.productCount})`;
            return items;
          }).join('\n')}`,
        });
        return pre;
      }, []);
      writeXLSX({
        filename: '商品记录.xlsx',
        sheets: [
          {
            data: data,
          },
        ],
      });
    });
  };

  return <Button onClick={getData}>下单商品</Button>;
}

export default memo(ExportExcel);
