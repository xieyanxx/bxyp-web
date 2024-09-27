import React, { useCallback, memo } from 'react';

import { Button } from 'antd';
import { formatTime, writeXLSX } from '@/utils';
import capitalFlow, { CashoutType } from '@/helper/services/capitalFlow';

function ExportExcel({ params }:any) {
    const getData = async () => {
        capitalFlow.cashoutList({ ...params, pageSize:1000 }).then((res) => {
            console.log(res,'====>>>')
            const data = res.data.reduce(
                (pre: any[], cur, index) => {
                    // excel序号从1开始， 表格第一行是标题
                    pre.push({
                        序号: index + 1,
                        ID: cur.id,
                        类型: CashoutType[cur.type],
                        用户名: cur.username,
                        用户电话: cur.phone,
                        金额: cur.income?Number(`${cur.amount}`):Number(`-${cur.amount}`),
                        创建时间:formatTime(cur.createTime)

                    });
                    return pre;
                },
                [],
            );
            writeXLSX({
                filename: '资金流水.xlsx',
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
