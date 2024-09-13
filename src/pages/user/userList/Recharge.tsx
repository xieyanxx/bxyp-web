import { NestedFormRef, NestedModalForm } from '@/components/Form';
import user, { ColumnUser } from '@/helper/services/user';
import { ProFormDigit } from '@ant-design/pro-components';
import { memo, useCallback, useRef } from 'react';

type Values = {
  basic: {
    chargeAmount: number;
  };
};
function Recharge({ raw, reload }: { raw?: ColumnUser; reload: () => void }) {
  const modal = useRef<NestedFormRef>(null);

  const submit = useCallback(
    async (values: Values) => {
      const { chargeAmount } = values.basic;
      const data = {
        chargeAmount: chargeAmount * 100, //后端金额单位为分
        userId: raw?.id || '',
      };
      return user.recharge(data).then((res) => {
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
      onFinish={submit}
      isEdit={!!raw}
      title={'充值'}
      btnContent={'充值'}
    >
      <ProFormDigit
        label="充值金额"
        name="chargeAmount"
        width={'md'}
        min={1}
        max={200000}
        addonAfter="元"
        rules={[
          {
            required: true,
            message: '请输入充值金额',
          },
        ]}
      />
    </NestedModalForm>
  );
}

export default memo(Recharge);
