import { NestedFormRef, NestedModalForm } from '@/components/Form';
import { ColumnOrder } from '@/helper/services/orderManage';
import user from '@/helper/services/user';
import {
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
} from '@ant-design/pro-components';
import { memo, useCallback, useRef } from 'react';

type Values = {
  basic: {
    labels: any;
  };
};
function Refund({ raw, reload }: { raw?: ColumnOrder; reload: () => void }) {
  const modal = useRef<NestedFormRef>(null);
  const getValues = useCallback(() => {
    if (raw) {
      const { orderItems } = raw;
      const data: any = {
        orderItems,
      };
      return data;
    }
  }, [raw]);
  const submit = useCallback(
    async (values: Values) => {
      console.log(values, '===>');

      return;
      user.updateUser(data).then((res) => {
        if (raw) {
          reload();
          return res;
        }
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
      //   layout={'vertical'}
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
        <ProFormGroup key="group">
          <ProFormSelect
            label="选择商品"
            name="orderItemNo"
            width="sm"
            valueEnum={{
              man: '男性',
              woman: '女性',
            }}
            rules={[
              {
                required: true,
              },
            ]}
          />
          {/* <ProFormDigit
            name="productCount"
            width={'sm'}
            label="选择数量"
            rules={[{ required: true }]}

          /> */}
          <ProFormSelect
            label="选择数量"
            rules={[
              {
                required: true,
              },
            ]}
            name="productCount"
            width="sm"
            valueEnum={{
              man: '男性',
              woman: '女性',
            }}
          />
        </ProFormGroup>
      </ProFormList>
    </NestedModalForm>
  );
}

export default memo(Refund);
