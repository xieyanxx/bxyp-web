import { NestedFormRef, NestedModalForm } from '@/components/Form';
import user, { ColumnUser } from '@/helper/services/user';
import { adminPwd } from '@/utils/regexp';
import { ProFormText } from '@ant-design/pro-components';
import { memo, useCallback, useRef } from 'react';

type Values = {
  basic: {
    password: string;
  };
};
function ChangePwd({ raw, reload }: { raw?: ColumnUser; reload: () => void }) {
  const modal = useRef<NestedFormRef>(null);

  const submit = useCallback(
    async (values: Values) => {
      const { password } = values.basic;
      const data = {
        password,
        userId: raw?.id || '',
      };
      return user.changePwd(data).then((res) => {
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
      title={'修改密码'}
      btnContent={'修改密码'}
    >
      <ProFormText.Password
        name="password"
        label="新密码"
        fieldProps={{ type: 'password', autoComplete: 'new-password' }}
        rules={adminPwd()}
      />
    </NestedModalForm>
  );
}

export default memo(ChangePwd);
