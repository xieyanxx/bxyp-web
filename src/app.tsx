// 运行时配置

import '@/utils/promise';
import { history } from '@umijs/max';
import RightContent from './features/layout/RightContent';
import Token from './helper/store/token';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  // if (!Token.isLogin() && history.location.pathname !== '/login') {
  //   history.replace({
  //     pathname: '/login',
  //   });
  //   return { name: '' };
  // }
  return { name: '@umijs/max' };
}
const defaultSettings = {
  title: '百优优选',
  navTheme: 'light',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  iconfontUrl: '',
  splitMenus: false,
  colorPrimary: '#67B800',
  // colorPrimary: '#1677ff',
};

export const layout = ({ initialState }: any) => {
  return {
    logo: '/logo.png',
    ...defaultSettings,
    disableContentMargin: true,
    siderWidth: 200,
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      // if (!Token.isLogin() && history.location.pathname !== '/login') {
      //   history.replace({
      //     pathname: '/login',
      //   });
      // }
    },

    menu: {
      locale: false,
    },
    menuFooterRender(props: any) {
      if (props?.collapsed) return undefined;
      return (
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(0,0,0,0.6)',
            paddingBlockStart: 12,
          }}
        >
          百优优选出版
        </p>
      );
    },
    rightContentRender: () => <RightContent />,
    menuHeaderRender: undefined,
  };
};
