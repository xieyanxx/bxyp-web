import loginSrv from '@/helper/services/login';
import Token from '@/helper/store/token';
import { adminName, adminPwd } from '@/utils/regexp';
import { history, useLocation } from '@umijs/max';
import { Button, Form, Input, message } from 'antd';
import { memo, useCallback, useState } from 'react';
import styles from './index.less';
type Values = { username: string; password: string };

const LoginCallback = (res: any, redirectUrl?: string) => {
  const { message: msg, nickname, token, avatarUrl, phone } = res.data;
  if (res.status === 200) {
    token && Token.setAccessToken(token);
    nickname && Token.setUser({ nickname, avatarUrl, phone });
    message.success('登录成功');
    // 重定向到url
    if (!!redirectUrl && redirectUrl.indexOf('login') === -1) {
      history.push(decodeURIComponent(redirectUrl));
    } else {
      history.push('/home');
    }
  } else {
    message.error(msg);
  }
};

function Login() {
  const [loading, setLoading] = useState<boolean>(false);
  const { redirect_url }: any = useLocation();
  const submit = useCallback((values: Values) => {
    setLoading(true);
    loginSrv
      .login({ ...values })
      .then((res) => {
        console.log(res,'===>')
        LoginCallback(res, redirect_url);
      })
      .catch((err) => {
        LoginCallback({ data: err });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <div className={styles.login}>
      <div className={styles.logo}>
        <img src={require('@/assets/images/logo.png')} alt="" />
      </div>
      <Form<Values> onFinish={submit} className={styles.form_wrap}>
        <div className={styles.text}>登录</div>
        <Form.Item name="phone" rules={adminName()}>
          <Input placeholder="请输入用户名" allowClear />
        </Form.Item>
        <Form.Item name="password" rules={adminPwd()}>
          <Input type="password" placeholder="请输入密码" allowClear />
        </Form.Item>
        <Button
          color="#67B800"
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          登录
        </Button>
      </Form>
      <footer className={styles.footer}>
        <a href="https://beian.miit.gov.cn">蜀ICP备2022013338号-1</a>
      </footer>
    </div>
  );
}

export default memo(Login);
