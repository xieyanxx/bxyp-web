import { NestedFormRef, NestedModalForm } from '@/components/Form';
import orderManage, {
  ColumnOrder,
  OrderItems,
} from '@/helper/services/orderManage';
import {
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { memo, useCallback, useRef, useState } from 'react';

type Values = Record<string, any>;
function Refund({ raw, reload }: { raw: ColumnOrder; reload: () => void }) {
  const modal = useRef<NestedFormRef<Values>>(null);
  const [refundData, setRefundData] = useState<OrderItems|any>([]);
  const [maxValue, setMaxValue] = useState(100);
  const getValues = useCallback(() => {
    if (raw) {
      const { orderItems } = raw;
      setRefundData(orderItems);
      // const data: any = {
      //   orderItems,
      // };
      // return data;
    }
  }, [raw]);
  const submit = useCallback(
    async (values: Values) => {
      const { orderItems } = values.basic;
      const paramsData={
        orderNo:raw?.orderNo,
        refundItems:orderItems
      }
      orderManage.OrderrRfund(paramsData).then((res) => {
        message.success('操作成功！')
        reload();
        return res;
      });
    },
    [raw, reload],
  );

  return (
    <NestedModalForm<Values>
      ref={modal}
      formName="basic"
      getValues={getValues}
      onFinish={submit}
      isEdit={!!raw}
      title={'退货'}
      btnContent={'退货'}

    >
      <ProFormList
        name="orderItems"
        label="选择商品"
        alwaysShowItemLabel
        min={1}
        initialValue={[
          {
            orderItemNo: '',
            productCount: '',
          },
        ]}
      >
        {(_: any, index: any) => (
          <ProFormGroup key="group">
            <ProFormSelect
              label="选择商品"
              name="orderItemNo"
              width="sm"
              options={refundData}
              fieldProps={{
                fieldNames: { label: 'productName', value: 'orderItemNo' },
                onChange: (value: number) => {
                  const maxQuantity =
                    refundData.find((option:any) => option.orderItemNo === value)
                      ?.productCount || 0;

                  const newData = modal.current
                    ?.getForm()
                    .getFieldValue('orderItems')[index];
                  newData[`maxQuantity`] = maxQuantity;
                },
              }}
              rules={[
                {
                  required: true,
                },
              ]}
            />
            <ProFormDigit
              name={[`refundCount`]}
              label="输入数量"
              width="sm"
              min={1}
              max={maxValue}
              placeholder={`请输入数量`}
              rules={[
                {
                  required: true,
                  message: '请输入数量',
                },
                ({}) => ({
                  validator(_: any, value: any) {
                    const maxQuantity =
                      modal.current?.getForm().getFieldValue('orderItems')[
                        index
                      ].maxQuantity || 0;
                    if (value > maxQuantity) {
                      return Promise.reject(
                        new Error(`最大输入 ${maxQuantity}`),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            />
          </ProFormGroup>
        )}
      </ProFormList>
    </NestedModalForm>
  );
}

export default memo(Refund);
