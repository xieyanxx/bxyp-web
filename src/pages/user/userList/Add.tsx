import { NestedFormRef, NestedModalForm } from '@/components/Form';
import user, { ColumnUser } from '@/helper/services/user';
import { adminPwd } from '@/utils/regexp';
import { ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-form';
import { memo, useCallback, useRef } from 'react';

type Values = {
  basic: {
    username: string;
    phone: string;
    password: string;
    shopName: string;
    shopAddr: string;
    debtLimit: number;
  };
};
function Add({ raw, reload }: { raw?: ColumnUser; reload: () => void }) {
  const modal = useRef<NestedFormRef>(null);
  const getValues = useCallback(() => {
    if (raw) {
      const { id, phone, username, shopName, shopAddr, debtLimit } = raw;
      const data: any = {
        phone,
        id,
        username,
        shopName,
        shopAddr,
        debtLimit,
      };
      return data;
    }
  }, [raw]);
  const submit = useCallback(
    async (values: Values) => {
      const { phone, username, shopName, shopAddr, password, debtLimit } =
        values.basic;
      const data: any = {
        phone,
        username,
        password,
        shopName,
        shopAddr,
        id: raw?.id,
        debtLimit: debtLimit * 100,
      };
      return user.updateUser(data).then((res) => {
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
    >
      <ProFormText
        name="username"
        label="用戶名"
        rules={[{ required: true }]}
        disabled={raw ? true : false}
      />
      <ProFormDigit
        name="debtLimit"
        width={'lg'}
        label="欠款额度"
        rules={[{ required: true }]}
        max={99999999}
      />
      <ProFormText
        name="phone"
        label="联系方式"
        rules={[
          {
            required: true,
            pattern: /^((1[0-9]{10}))$/,
            message: '请输入正确的联系方式',
          },
        ]}
        fieldProps={{
          autoComplete: 'new-password',
        }}
      />
      {!raw && (
        <ProFormText.Password
          name="password"
          label="密码"
          fieldProps={{ type: 'password', autoComplete: 'new-password' }}
          rules={adminPwd()}
        />
      )}
      <ProFormText
        name="shopName"
        label="店铺名称"
        rules={[{ required: true }]}
      />
      <ProFormTextArea
        name="shopAddr"
        label="店铺位置"
        rules={[{ required: true }]}
      />
    </NestedModalForm>
  );
}

export default memo(Add);
