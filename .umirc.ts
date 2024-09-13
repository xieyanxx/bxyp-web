import { defineConfig } from '@umijs/max';

const base = '/';
const ENV = process.env.ENV || 'DEV';
const API_URL_MAP = {
  PROD: 'https://api.langlangsan.cn',
  TEST: 'https://api.test.langlangsan.cn',
  DEV: 'http://8.137.49.13:9090/',
  // DEV: 'https://api.langlangsan.cn',
} as any;

const ADMIN_URL_MAP = {
  PROD: 'https://adm.langlangsan.com',
  TEST: 'https:/adm.test.langlangsan.com',
  DEV: 'http://localhost:8000',
} as any;
export const API_HOST: string = API_URL_MAP[ENV] || API_URL_MAP.DEV;
const BUILD_TARGET = process.argv[3]?.toUpperCase() || 'DEV';

export default defineConfig({
  title: '百鲜优品',
  antd: {},
  access: {},
  model: {},
  initialState: {},
  hash: true,
  request: {},
  layout: {
    title: '百鲜优品',
  },

  define: {
    ENV: process.env.ENV,
    API_URL: API_URL_MAP[ENV] || API_URL_MAP.DEV,
    ADMIN_URL: ADMIN_URL_MAP[ENV],
    BUILD_TARGET,
  },
  routes: [
    {
      layout: false,
      path: '/login',
      component: '@/pages/login',
    },
    {
      path: '/',
      redirect: '/home',
      exact: true,
    },
    {
      name: '首页',
      path: '/home',
      icon: 'CrownOutlined',
      component: '@/pages/home',
    },

    {
      name: '用户管理',
      path: '/user',
      icon: 'UserOutlined',
      routes: [
        {
          name: '用户列表',
          path: '/user/userList',
          component: '@/pages/user/userList',
        },
      ],
    },
    {
      name: '分类管理',
      path: '/classification',
      icon: 'MenuOutlined',
      component: '@/pages/classification',
    },
    {
      name: '商品管理',
      path: '/productManage',
      icon: 'GoldOutlined',
      component: '@/pages/productManage',
    },
    {
      name: '订单管理',
      path: '/orderManage',
      icon: 'OrderedListOutlined',
      component: '@/pages/orderManage',
    }
  ],
  theme: {
    '@primary-color': '#67B800',
    '@link-color': '#0091FB',
    '@success-color': '#37C432', // 成功色
    '@warning-color': '#FFAD34', // 警告色
    '@error-color': '#FF4E55', // 错误色
    '@heading-color': '#000000', // 标题色
    '@text-color': '#000000', // 主文本色
    '@text-color-secondary': '#333333', // 次文本色
    '@disabled-color': '#B2B2B2', // 失效色
    '@tag-bg': '#f6ffed',
    '@tag-text': '#1677ff',
    '@status-0': '#ff6000',
    '@status-1': '#166ff7',
    '@status-2': '#4ca740',
    '@status-3': '#FF3A43',
    '@status-4': '#999999',
  },
  npmClient: 'yarn',
});
