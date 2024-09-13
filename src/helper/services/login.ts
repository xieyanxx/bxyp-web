// import request from './request';

import { request } from './request';

export default {
 
  login: (data: { phone?: string; password?: string }) =>
    request({
      url: '/user/bis/login',
      method: 'POST',
      data,
    }),
};
