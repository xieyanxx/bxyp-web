// import request from './request';

import { request } from './request';

export default {
  login: (data: { username: string; password: string }) =>
    request({
      url: '/mall/public/admin/login',
      method: 'POST',
      data,
    }),
  addUser: (data: {
    username: string;
    password: string;
    phone: string;
    shopAddr: string;
    shopName: string;
    debtLimit: number;
    admin: boolean;
  }) =>
    request({
      url: '/mall/public/test/user/add-user',
      method: 'POST',
      data,
    }),
};
