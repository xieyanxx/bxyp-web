import { ApiModuleTest } from './apiModuleTest';

export const FetchMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export const FetchMethodMap = FetchMethod.reduce((pre, cur) => {
  pre[cur] = cur;
  return pre;
}, {} as Record<string, string>);
export const AdminStatus = {
  1: { text: '生效', status: 'Success' },
  0: { text: '失效', status: 'Error' },
} as const;
export const ApiTypeMap = { OWN: '控制台接口', OTHER: '第三方接口' } as const;
// 超级管理员code，后台固定的
export const SuperAdminCode = 'ADMIN';
// 定义管理员操作类型
export const ApiInterfaceTypeMap = {
  POST: '增',
  DELETE: '删',
  PUT: '改',
  GET: '查',
} as const;
export const ApiInterfaceTypeOptions = Object.entries(
  ApiInterfaceTypeMap,
).reduce(
  (pre, [value, label]) => {
    pre.push({ value, label });
    return pre;
  },
  [] as {
    value: string;
    label: string;
  }[],
);
// 鉴权失败的HTTP status
export const AuthFailedStatus = 401;
// 接口成功（200<= http status < 300）返回并且返回体code为20000才算响应成功
// 第三方接口可能不一样
export const SuccessResCode = 200;
export { ApiModuleTest };
