
import { SuccessResCode } from '@/constants';
import {
  delError,
  filterObject,
  hasCaseInsensitiveProperty,
  isStrictObject,
} from '@/utils';
import { history } from '@umijs/max';
import { message } from 'antd';
import type {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
} from 'axios';
import axios from 'axios';
import COS from 'cos-js-sdk-v5';
import { cloneDeep, isFunction } from 'lodash';
import Token from '../store/token';
const ProxyApi = 'console-service/proxy';
const RequestTimeout = 20000;
const TimeoutErrorMessage = '请求响应超时';

/**
 * @description: 从AxiosRequestHeaders中取值，key可能是大写或小写
 */
function getHeadersValue(
  key: string,
  data: AxiosRequestHeaders,
): string | number | boolean | void {
  if (isStrictObject(data)) {
    return Object.entries(data).find(
      ([k]) => k.toLocaleLowerCase() === key.toLocaleLowerCase(),
    )?.[1];
  }
}
/**
 * * application/x-www-form-urlencoded 是form默认提交格式，会把数据urlencode后像URL传参一样序列化数据，简单点直接URLSearchParams().toSrting()。注意url长度不能过长，大约120个字符
 * * application/octet-stream 当body是单个二进制数据时，可以使用此mime
 * * multipart/form-data 当body包含二进制数据和其他格式数据时必须使用此mime，使用FormData封装
 * * 三种form格式的差异可以参考 https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
 * *
 */
const ContentTypeFormat = {
  'application/x-www-form-urlencoded': function (data: unknown) {
    if (isStrictObject(data)) {
      const params = new URLSearchParams();
      Object.entries(data).map(([k, v]) => {
        // 默认转化v成string
        params.append(k, v as any);
      });
      return params.toString();
    }
    return data;
  },
  'multipart/form-data': function (data: unknown) {
    if (isStrictObject(data)) {
      const params = new FormData();
      Object.entries(data).map(([k, v]) => {
        // 默认转化v成string
        if (Array.isArray(v) && v[0] instanceof File) {
          v.forEach((item) => {
            params.append(k, item);
          });
        } else {
          params.append(k, v as any);
        }
      });
      return params;
    }
    return data;
  },
  'application/octet-stream': function (data: unknown) {
    if (typeof data === 'string') {
      return new Blob([data], { type: 'text/plain; charset=UTF-8' });
    } else if (data instanceof Blob) {
      return data;
    }
    return data;
  },
};

/**
 * * 处理常见的分页接口
 * * 用装饰器 class method 没有类型推导
 */

function listRes<T = any, P = any>(
  res: Promise<AxiosResponse<RawRequestListData<P>>>,
  config?:
    | ((data: any) => T)
    | ({
        transform?: (data: any) => T;
      } & MsgType),
): Promise<{
  data: T[];
  total: number;
  success: boolean;
}> {
  let transform;
  if (typeof config === 'function') {
    transform = config;
  } else if (config?.transform) {
    transform = config.transform;
  }
  const sucmsg: string | undefined = (config as any)?.sucmsg;
  const errmsg: string | undefined = (config as any)?.errmsg;
  return res
    .then(({ data }) => {
      sucmsg && message.success(sucmsg);
      const content = data?.content || [];
      const totalElements = data?.totalElements || 0;
      return {
        data: transform ? content.map((v) => transform(v)) : content,
        total: totalElements,
        success: Array.isArray(data?.content),
      };
    })
    .catch((error) => {
      const emsg = delError(error).message;
      message.error(errmsg || emsg);
      return { data: [], total: 0, success: false };
    });
}

const SuccessOnlyKey = ['result', 'success'];
/**
 * @description 处理需要返回Boolean的接口
 * * 返回体是对象，一般有且仅有一个key（'result','success'）表示处理结果，也有保存更新接口会返回新数据
 * * 返回体是Boolean表示处理结果
 * * 其余的resolve就处理成功，reject就处理失败
 * * 如果返回的body是个对象且有successkey，会以 !!body[successkey] 为处理结果
 */
function successRes<T = any>(
  res: Promise<AxiosResponse<T>>,
  config?: {
    successkey?: string;
  } & MsgType,
) {
  const { successkey, sucmsg, errmsg } = config || {};
  return res
    .then(({ data }) => {
      let tag = false;
      if (isStrictObject(data)) {
        // 如果返回的body是个对象且有successkey，会以 !!body[successkey] 为处理结果
        if (typeof successkey === 'string' && Object.hasOwn(data, successkey)) {
          tag = !!data[successkey];
        } else {
          const keys = Object.keys(data);
          if (keys.length === 1 && SuccessOnlyKey.includes(keys[0])) {
            // 如果body只有一个key且在SuccessOnlyKey中，以这个key为结果
            tag = !!data[keys[0]];
          } else {
            // 默认返回了对象就成功
            tag = true;
          }
        }
      } else if (typeof data === 'boolean') {
        // 返回体是个Boolean
        tag = data;
      } else {
        // 默认返回200就是处理成功
        tag = true;
      }
      tag ? sucmsg && message.success(sucmsg) : errmsg && message.error(errmsg);
      return tag;
    })
    .catch((error) => {
      message.error(errmsg || delError(error).message);
      return false;
    });
}

/**
 * @description: 尽管request有response拦截，但是可能由于前端处理返回体时可能有逻辑错误，error依旧要在处理一遍
 */
function msgErr(error: any, duration: number = 3) {
  message.error(delError(error).message, duration);
}

/**
 * @description: 创建axios实例，配置headers、拦截请求和响应
 */
function createApiInstance() {
  const $http = axios.create({
    baseURL: API_URL,
    timeout: RequestTimeout,
    timeoutErrorMessage: TimeoutErrorMessage,
  });
  $http.interceptors.request.use(
    (config: any) => {
      const token = Token.getAccessToken();
      // 非登录接口都要带token
      if (
        config.url !== 'console-service/login' &&
        typeof token === 'string' &&
        !config.headers.Authorization
      ) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    },
  );
  /**
   * 按照axios默认配置，2xx 才算响应成功（早期几个接口除外），其他算失败
   */
  $http.interceptors.response.use(
    (response) => {
      if (hasCaseInsensitiveProperty(response.headers, 'Set-Token')) {
        let token = response.headers['Set-Token'.toLocaleLowerCase()];
        localStorage.setItem('token', `Bearer ${token}`);
      }
      if (response.status !== SuccessResCode) {
        return Promise.reject(delError(response.data));
      } else {
        return Promise.resolve(response);
      }
    },
    (error: any) => {
      // if (error?.response?.status === 401 || error?.response?.status === 0) {
      //   history.replace('/login');

      // }
      // 大部分接口报错是这样的
      if (typeof error?.response?.data?.code === 'number') {
        return Promise.reject(delError(error.response.data));
      }
      return Promise.reject(error);
    },
  );
  return $http;
}

const $http = createApiInstance();

/**
 * * 基于axios再封装一层，方便以后替换
 * * 虽然目前的参数配置严重依赖axios，但是替换时也可封装实现，且实际使用中绝大部分config只使用了基本配置
 * ! 默认会过滤params和data中的无效值
 * * 默认会转化data
 */
function network<T = any, D = any>(
  config: RequestConfigType<D>,
): Promise<AxiosResponse<T, D>> {
  const { extra = {}, ...rest } = config;
  // 默认过滤 params data 中无效值的
  if (extra.filterData !== false) {
    rest.params = filterObject(rest.params);
    rest.data = filterObject(rest.data);
  }
  // 处理外部连接
  if (/^https?:\/\//i.test(rest.url)) {
    rest.baseURL = undefined;
  }
  // 格式化data
  if (extra.transformData !== false) {
    if (typeof extra.transformData === 'function') {
      rest.data = extra.transformData(rest.data);
    } else {
      const contentType = getHeadersValue('Content-Type', rest.headers as any);
      const format = ContentTypeFormat[contentType + ''];
      // 格式化非JSON格式data。默认会按JSON格式序列化data
      if (
        !(
          contentType === undefined ||
          /application\/json/i.test(contentType + '')
        ) &&
        rest.data !== undefined &&
        format
      ) {
        rest.data = format(rest.data);
      }
    }
  }
  return $http(rest);
}

async function getSourceUrlById(params: {
  file: any;
  id: UploadType;
}): Promise<
  | { success: true; data: any }
  | { success: false; data: ReturnType<typeof delError> }
> {
  const {
    tmpSecretId,
    tmpSecretKey,
    sessionToken,
    bucket,
    region,
    expiredTime,
  } = params.id;
  const uploadNameRes = await network({
    url: '/biz/cos/newFilePrefixName',
    method: 'GET',
    params: { biz: 'COMMON' },
  })
    .then(({ data }) => {
      return { success: true, data: data } as const;
    })
    .catch((error) => ({ success: false, data: delError(error) } as const));
  const cos = new COS({
    // 必选参数
    getAuthorization: (options: any, callback: any) => {
      callback({
        TmpSecretId: tmpSecretId,
        TmpSecretKey: tmpSecretKey,
        XCosSecurityToken: sessionToken,
        ExpiredTime: expiredTime,
      });
    },
  });
  return cos
    .putObject({
      Bucket: bucket /* 必须 */,
      Region: region,
      Key: uploadNameRes.data + '.' + params.file.name.split('.').pop(),
      Body: params.file, // 上传文件对象
      StorageClass: 'STANDARD',
    })
    .then((res) => {
      return { success: true, data: res } as const;
    })
    .catch((error) => {
      const data = delError(error);
      message.error(data.message);
      return { success: false, data } as const;
    });
}
type UploadType = {
  tmpSecretId: string;
  tmpSecretKey: string;
  sessionToken: string;
  bucket: string;
  region: string;
  expiredTime: number;
};
async function upload(config: {
  bizType: string;
  fileCount?: number;
  file: any;
}) {
  const type = config.bizType;
  const uploadRes = await network({
    url: '/biz/cos/auth',
    method: 'POST',
    data: { ...config },
  })
    .then(({ data }) => {
      return { success: true, data: data } as const;
    })
    .catch((error) => ({ success: false, data: delError(error) } as const));

  if (!uploadRes.success)
    return { success: false, data: uploadRes.data } as {
      success: false;
      data: ReturnType<typeof delError>;
    };
  return getSourceUrlById({ file: config.file, id: uploadRes.data }).then(
    ({ success, data }) => {
      if (success) {
        const url: string = 'https://' + data.Location;
        return {
          success: true,
          data: { url, id: data.RequestId },
        };
      } else return { success, data } as any;
    },
  );
}

/**
 * @name 可以重试n次的request
 * @description 当count和next不合要求只会请求一次
 * @description 跟$http的拦截器相关
 * @param config 请求参数
 * @param count 重试次数，本身会请求1次，默认重试1次
 * @param success 响应是否成功，false会重试到次数用完，默认返回true
 * @param aborted 是否中断请求，每次重试完都会检查aborted.value，为true会停止重试并返回结果
 */
function retry<T = any, D = any>(
  config: RequestConfigType<D>,
  count: number = 1,
  success: (response: AxiosResponse<T, D>) => boolean = () => true,
  aborted: { value?: boolean } = {},
): Promise<AxiosResponse<T, D>> {
  if (count <= 0 || !isFunction(success)) return network(config);
  let n = -1;
  const nextStep = () =>
    network(config)
      .then((data) => ({ done: success(data), data }))
      .catch((error) => ({ done: false, data: error }))
      .then(({ done, data }) => {
        if (done && !aborted.value) return data;
        ++n;
        if (n === count || aborted?.value) {
          return done ? data : Promise.reject(data);
        }
        return nextStep();
      });
  return nextStep();
}

/**
 * @name 获取分页接口全部数据
 * @description 约定分页接口参数（params或data）中分页字段是page、size，size可省略默认100，page会被覆盖
 * @description 分页接口返回JSON数据，content是数组，totalElements是总数
 * @description 有一页失败，就会失败，data是[]
 */
async function wholeList<
  T = any,
  P = T,
  D extends { size?: number; [K: string]: any } = {
    size?: number;
    [K: string]: any;
  },
>(
  config: ListRequestConfigType<D> | any,
  transfrom: (item: T) => P = (_) => _ as unknown as P,
) {
  config = cloneDeep(config);
  let page = 0,
    list: P[] = [];
  const key = isStrictObject(config.data) ? 'data' : 'params';
  if (!config[key]) {
    config[key] = {} as D;
  }
  if (!config[key]?.size) {
    config[key].size = 100;
  }
  const size = config[key]?.size;
  (config[key] as any).page = page;
  const first = await request(config)
    .then(({ data: { content, totalElements } }) => ({
      data: content.map(transfrom),
      count: totalElements,
    }))
    .catch((error) => {
      request.msgErr(error);
    });
  if (!first) return { success: false, data: list };
  if (first.count === first.data.length)
    return { success: true, data: first.data as P[] };
  list = list.concat(first.data);
  const length = Math.ceil(first.count / size) - 1;
  const tasks = Array.from<any>({ length }).reduce((pre, cur, index) => {
    (config[key] as any).page = index + 1;
    pre.push(request(config));
    return pre;
  }, []);
  return Promise.all(tasks)
    .then((res) => {
      res.forEach(({ data: { content } }) => {
        list = list.concat(content.map(transfrom));
      });
      return { success: true, data: list };
    })
    .catch((error) => {
      request.msgErr(error);
      return { success: false, data: [] as P[] };
    });
}

Object.defineProperties(network, {
  listRes: {
    value: listRes,
  },
  successRes: {
    value: successRes,
  },
  delError: {
    value: delError,
  },
  upload: {
    value: upload,
  },
  getSourceUrlById: {
    value: getSourceUrlById,
  },
  message: {
    value: message,
  },
  msgErr: {
    value: msgErr,
  },
  retry: {
    value: retry,
  },
  wholeList: {
    value: wholeList,
  },
});

/**
 * @description 类似axios(config)
 * * 使用时除了then中处理正常操作，还要catch处理异常而不是在then中传第二个参数。具体看Promise原理
 * * then中建议直接按接口文档格式数据格式处理，报错会被catch，早发现早解决
 * * catch返回的error大概率是delError处理过的，但是也会有直接返回接口抛出的异常，也会有then中逻辑错误
 * * 绑定了几个常用方法，避免过多的import
 * * 默认会过滤params和data中的无效值
 * * 默认会处理content-type是application/x-www-form-urlencoded、multipart/form-data、application/octet-stream的data
 */
const request = network as unknown as RequestFunctionType;

type MsgType = { sucmsg?: string; errmsg?: string };

export type ExtraRequestConfigType = {
  filterParams?: boolean;
  filterData?: boolean;
  transformData?: ((data: any) => any) | boolean;
};

export type RequestConfigType<T = any> = Omit<
  AxiosRequestConfig<T>,
  'url' | 'method'
> & {
  extra?: ExtraRequestConfigType;
  url: string;
  method?: Uppercase<Method>;
};
type ListRequestConfigType<T = any> = Omit<RequestConfigType<T>, 'params'> & {
  params?: T;
};

export type RequestFunctionType = (<T = any, D = any>(
  config: RequestConfigType<D>,
) => Promise<AxiosResponse<T, D>>) & {
  listRes: typeof listRes;
  successRes: typeof successRes;
  delError: typeof delError;
  message: typeof message;
  upload: typeof upload;
  getSourceUrlById: typeof getSourceUrlById;
  msgErr: typeof msgErr;
  retry: typeof retry;
  wholeList: typeof wholeList;
};

export type RequestUploadReturns = {
  img: { url: string; imgId: string };
  video: {
    videoId: string;
    thumbnail?: string;
    url: string;
    duration: number;
  };
  audio: { audioId: string; url: string; duration: number };
  m3u8: { url: string };
  common: { url: string };
};

export { $http, request };
