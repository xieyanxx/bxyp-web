import { message } from 'antd';
import ClipboardJS from 'clipboard';
import dayjs from 'dayjs';
import { isNumber, isString } from 'lodash';
import { session } from './storage';
// import { request, $http } from './request';
import { entities2Utf16 } from './encoding';
import {
  base642File,
  dowloadFile,
  file2base64,
  link2file,
  readZIP,
  svg2imgSrc,
} from './file';
import { index2XLSXIndex } from './number';
import * as util_regexp from './regexp';
import { LowercaseLetters, UppercaseLetters } from './string';
import { readXLSX, writeXLSX } from './xlsx';

const ErrorCodeMap = {
  // 开放平台
  11001: '请检查手机号是否正确',
  11002: '密码错误',
} as any;

function delError(error: any) {
  const code = error?.code;
  let message = error?.debug || error?.msg || error?.mesg || error?.message;
  if (!message) {
    if (typeof error === 'string') {
      message = error;
    } else {
      message = 'service error';
    }
  }
  const data: { code?: number; message: string } = {
    code,
    message,
  };
  if (isNumber(code) && ErrorCodeMap[code]) {
    data.message = ErrorCodeMap[code];
  }
  return data;
}

/**
 * @description: 跳转到login
 */
function redirect2login() {
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  if (window.location.pathname !== '/login') {
    window.location.href = redirect
      ? window.location.origin + '/login?redirect=' + redirect
      : window.location.origin +
        '/login?redirect=' +
        encodeURIComponent(location.pathname + location.search);
  }
}

/**
 * @param {Record} data
 * @param {boolean=false} number
 */
function map2options(
  data: Record<string, string | number>,
  number: boolean = false,
) {
  return Object.entries(data).reduce(
    (pre: { value: number | string; label: string }[], [value, label]) => {
      pre.push({
        value: number ? Number(value) : value,
        label: label + '',
      } as const);
      return pre;
    },
    [],
  );
}

/**
 * @param {(string | number)[]} data
 * @param {boolean=false} number
 */
function keys2Options(data: (string | number)[], number: boolean = false) {
  return data.reduce((pre, cur) => {
    pre.push({ label: cur + '', value: number ? Number(cur) : cur });
    return pre;
  }, [] as { value: string | number; label: string }[]);
}

function formatTime(time: number | string | Date | undefined) {
  try {
    if (time) {
      const data = dayjs(time);
      return data.valueOf() >= 0 ? data.format('YYYY-MM-DD HH:mm:ss') : '-';
    }
    return '-';
  } catch (e) {
    return '-';
  }
}

/**
 * @name 资源转image元素
 * @description 可以读取图片的宽高。不能通过src再次转资源了
 */
function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      if (img.src.startsWith('blob:')) {
        URL.revokeObjectURL(img.src);
      }
      resolve(img);
    };
    img.onerror = reject;
    if (typeof src === 'string') {
      img.src = src;
    } else if (src) {
      img.src = URL.createObjectURL(src);
    } else {
      reject(new Error('src error'));
    }
  });
}
function loadVideo(data: File | string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    if (!data) {
      return reject(new Error('参数错误'));
    }
    let src: any;
    if (typeof data === 'string') {
      src = data;
    } else {
      src = URL.createObjectURL(data);
    }
    const video = document.createElement('video');
    video.oncanplay = function () {
      resolve(video);
    };
    video.onerror = function (e: any) {
      reject(e);
    };
    video.src = src;
    video.style.display = 'none';
    video.muted = true;
    video.autoplay = true;
    document.body.appendChild(video);
  });
}

/**
 * @description: 格式化时长成(00:)(00:)00
 * @param {number} data 毫秒
 * @param {true} def
 * @return {*}
 */
function formatDuration(data: number, def?: true) {
  if (!data || typeof data !== 'number') return '';
  const d = parseInt(data / 1000 + '');
  const m = parseInt(d / 60 + '');
  const h = parseInt(m / 60 + '');
  const m1 = h ? m - h * 60 : m;
  const d1 = m ? d - m * 60 : d;
  const defStr = def ? '00' : '';
  const res = [
    h ? (h > 9 ? h : '0' + h) : defStr,
    m1 ? (m1 > 9 ? m1 : '0' + m1) : defStr,
    d1 ? (d1 > 9 ? d1 : '0' + d1) : '00',
  ];
  return res.filter((v) => v).join(':');
}

/**
 * @description: 逆向formatDuration成豪秒
 * @param {string} data (00:)(00:)00
 * @return {*}
 */
function formatDuration2Number(data: string): number {
  let [s, m, h] = data.split(':').reverse();
  const defStr = '00';
  s = (s === defStr ? 0 : Number(s || 0)) as any;
  m = (m === defStr ? 0 : Number(m || 0) * 60) as any;
  h = (h === defStr ? 0 : Number(h || 0) * 60 * 60) as any;
  return ((s + m + h) as unknown as number) * 1000;
}
function isUsefulBasicType(data: any) {
  return (
    typeof data === 'string' ||
    (typeof data === 'number' && !Number.isNaN(data))
  );
}

/**
 * @name 生成uuid(v6)
 */
function uuid() {
  const url = URL.createObjectURL(new Blob());
  URL.revokeObjectURL(url);
  return url.split('/').slice(-1)[0];
}

/**
 * @description 从资源连接中获取文件名
 */
function getSourceNameByUrl(url: string, def: string = 'file.text') {
  const last = url.split('/').slice(-1)[0] || '';
  if (last.includes('.')) return last;
  return def;
}

/**
 * @description 判断一个变量是不是类似promise
 */
function isPromise<T = any>(obj?: any): obj is PromiseLike<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

function createClipboard(selector: any, getText?: () => string) {
  const clipboard = new ClipboardJS(selector, {
    text: getText,
  });
  clipboard.on('success', () => {
    message.success('复制到剪切板成功');
  });
  clipboard.on('error', (e) => {
    message.error(e.action + ' 失败');
  });

  const { copy, cut } = ClipboardJS;
  return { clipboard, copy, cut };
}

export default function handleClipboard(event: any) {
  const clipboard = new ClipboardJS(`#${event}`);
  clipboard.on('success', () => {
    message.success('复制成功');
    clipboard.destroy();
  });
  clipboard.on('error', () => {
    message.error('复制失败');
    clipboard.destroy();
  });
}

/**
 * @description: 是不是{}结构
 * @param {any} data
 * @return {*}
 */
function isObjectStict(data?: any): data is Record<string, any> {
  return Object.prototype.toString.call(data) === '[object Object]';
}

/**
 * @description: 简单的异步任务队列，从左往右按顺序同步执行，最终返回全部结果
 * ! 记得每个任务要catch
 */
function pmap<T = any>(data: (() => Promise<T>)[]) {
  const results: T[] = [];
  return new Promise<T[]>((resolve, reject) => {
    if (!data.length) return resolve([...results]);
    function fn(index: number): any {
      if (index >= data.length) return resolve([...results]);
      return data[index]()
        .then((res) => ((results[index] = res), fn(index + 1)))
        .catch(reject);
    }
    fn(0);
  });
}

/**
 * @description: 全部一起触发，不管失败与否，等都结束了返回全部结果
 *  ! 记得每个任务要catch
 */
function pamap<T = any>(data: (() => Promise<T>)[]) {
  let results: T[] = [];
  let count = data.length;
  if (!count) return Promise.resolve(results);
  results = Array.from({ length: data.length });
  return new Promise<T[]>((resolve, reject) => {
    data.map((fn, index) =>
      fn()
        .then((res) => {
          --count;
          results[index] = res;
        })
        .catch((error) => {
          --count;
          reject(error);
        })
        .finally(() => {
          if (!count) {
            resolve(results);
          }
        }),
    );
  });
}

/**
 * @description: 简单的异步任务队列，从左往右按顺序同步执行，上个任务的执行结果会传给下个函数
 * ! 记得每个任务要catch
 */
function pconnect<T = any>(data: ((index: number, value?: T) => Promise<T>)[]) {
  return new Promise<void>((resolve, reject) => {
    if (!data.length) return resolve();
    function fn(index: number, value?: T): any {
      return data[index](index, value)
        .then((res) => {
          if (index + 1 < data.length) {
            return fn(index + 1, res);
          }
          return resolve();
        })
        .catch(reject);
    }
    fn(0);
  });
}

/**
 * @description: 简单处理url query，复杂情况自行解决
 */
function parseQuery<T extends Record<string, string> = Record<string, string>>(
  keys: (keyof T)[],
  search: string = window.location.search,
) {
  const params = new URLSearchParams(search);
  return keys.reduce((pre, key) => {
    const value = params.get(key as string) || '';
    // @ts-ignore
    pre[key] = decodeURIComponent(value);
    return pre;
  }, {} as T);
}

function file2arrayBuffer(file: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      e.target?.result
        ? resolve(e.target.result as ArrayBuffer)
        : reject(new Error('e.target is null'));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * @description: 把字节数转换成合理的字符串
 * @param {number} data 字节数，byte
 */
function byte2string(data: number): string {
  if (!Number.isFinite(data)) return '';
  const gutter = 1024;
  let pre = data;
  let res = data / gutter;
  if (res < 1) return pre.toFixed(2).replace(/\.?(0+)?$/, '') + 'B';
  pre = res;
  res = pre / 1024;
  if (res < 1) return pre.toFixed(2).replace(/\.?(0+)?$/, '') + 'KB';
  pre = res;
  res = pre / 1024;
  if (res < 1) return pre.toFixed(2).replace(/\.?(0+)?$/, '') + 'M';
  pre = res;
  res = pre / 1024;
  if (res < 1) return pre.toFixed(2).replace(/\.?(0+)?$/, '') + 'G';
  return pre.toFixed(2).replace(/\.?(0+)?$/, '') + 'G';
}

function isAvailableNumber(data: unknown): data is number {
  return (
    typeof data === 'number' && !Number.isNaN(data) && Number.isFinite(data)
  );
}
/**
 * @description: data 是不是 {} 结构
 */
function isStrictObject(data: unknown): data is Record<string, unknown> {
  return Object.prototype.toString.call(data) === '[object Object]';
}

/**
 * @description: 后端接口一般不接收undefined、null、NaN
 * Map直接stringify也会变样
 * function和Symbol直接stringify会被省略
 */
function isUnusableValue(data: unknown) {
  return data === null || data === undefined || Number.isNaN(data);
}

/**
 * @description: 从URL字面信息获取文件名
 */
function getFileNameByUrl(url: string = '', extension: string = 'png') {
  if (typeof url !== 'string') return `获取文件名失败.${extension}`;
  const last = url.split('/').slice(-1)[0] || '';
  if (/\.\w+$/i.test(last)) return last;
  return `获取文件名失败.${extension}`;
}

/**
 * @description 从源数据中取值，属性可以是数组，当取到的结果是undefined时返回默认值
 */
function getProperty<T = any>(
  data: any,
  key: string | number | readonly (string | number)[],
  def?: T,
): T | void {
  try {
    if (['number', 'string'].includes(typeof key)) {
      const res = data[key + ''];
      return res === undefined ? def : res;
    } else if (Array.isArray(key) && key.length) {
      let cur = data;
      for (let i = 0; i < key.length; i++) {
        cur = cur[key[i]];
      }
      return (cur === undefined ? def : cur) as unknown as T;
    }
    return def;
  } catch (e) {
    return def;
  }
}

/**
 * @name 数字输入框，格式化函数集合
 */
const InputNumberFormatter = {
  /**
   * @name 只能输入整数
   */
  integer: (value: string | number) => {
    if (Number.isNaN(value)) return '';
    if (!value) return '';
    if (typeof value === 'string' && !/^-?\d+(\.\d+)?$/.test(value.trim()))
      return '';
    return parseInt((value + '').trim()) + '';
  },
};

/**
 * @description 过滤传给后端的参数:null、undefined、Infinity、NaN，Symbol、function在stringify时会自动过滤
 */
function filterObject<T = Record<string, any>>(data: T): T {
  if (isStrictObject(data)) {
    return Object.entries(data).reduce((pre, [key, value]) => {
      if (!isUnusableValue(value)) {
        pre[key] = filterObject(value);
      }
      return pre;
    }, {} as T);
  } else if (Array.isArray(data)) {
    return data.reduce((pre, cur) => {
      if (!isUnusableValue(cur)) {
        pre.push(filterObject(cur));
      }
      return pre;
    }, [] as T);
  } else return data;
}

function defualtOmitFilter(value: unknown) {
  return value == null || Number.isNaN(value) || value === '';
}

/**
 * @name 过滤一些表单值
 * @description 只过滤对象的键
 * @description 输入框，点击清除后依然保留字段成''，而不是移除字段。只会是对象结构
 * @warning 表单值只会是对象结构，最多再嵌套对象或数组
 */
function omitFormValue<T extends Record<string, any> = Record<string, any>>(
  values: T,
  filter: (value: any) => boolean = defualtOmitFilter,
) {
  if (!isStrictObject(values)) return values;
  function fn(data: any) {
    if (isStrictObject(data)) {
      return Object.entries(data).reduce((pre, [key, value]) => {
        if (!filter(value)) {
          pre[key] = fn(value);
        }
        return pre;
      }, {} as any);
    } else if (Array.isArray(data)) {
      return data.reduce((pre, cur) => {
        if (isStrictObject(cur) || Array.isArray(cur)) {
          pre.push(fn(cur));
        } else {
          pre.push(cur);
        }
        return pre;
      }, [] as any);
    }
    return data;
  }
  return fn(values);
}

/**
 * @name 格式化参数对象成querystring
 * @description 对象只处理一层；URL会被编码；数组会按同一个key追加n次
 * @description 会过滤value，只支持stirng|number
 */
function record2QueryString(
  query?: Record<string, string | number | Array<string | number>>,
) {
  if (!isStrictObject(query)) return '';
  const reg = /^https?:\/\//;
  function encoderURL(data: string | number) {
    data = data + '';
    return reg.test(data) ? encodeURIComponent(data) : data;
  }
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length) {
      value.forEach((q) => {
        (isNumber(value) && !Number.isNaN(value)) ||
          (isString(value) && search.append(key, encoderURL(q)));
      });
    } else if (isNumber(value) && !Number.isNaN(value)) {
      search.set(key, value + '');
    } else if (isString(value)) {
      search.set(key, encoderURL(value));
    }
  });
  return search.toString();
}

/**
 * @name 从URL格式化参数
 * @description 每个value都会被decode，遇到一个key有多个值才会被识别成数组
 */
function url2Record(url?: string) {
  const query: Record<string, string[] | string> = {};
  if (!isString(url)) return query;
  const search = (url?.split('?')[1] || '').trim();
  if (!search) return query;
  const params = new URLSearchParams(search);
  for (const key of params.keys()) {
    const value = params.getAll(key);
    query[key] = value.length > 1 ? value : value[0];
  }
  return query;
}

function toHourMinute(minutes: number) {
  if (minutes < 0) {
    return '';
  }
  let ss = (minutes % 60) as any;
  ss < 10 ? (ss = '0' + ss) : ss;
  let hh = Math.floor(minutes / 60) as any;
  hh < 10 ? (hh = '0' + hh) : ss;
  let time = hh + ':' + ss;
  return time;
}
function toMinute(time: any) {
  let minutes = time.split(':');
  return Number(minutes[0] * 60) + Number(minutes[1]);
}
const getPrice = (arr: any) => {
  return arr.reduce(
    (accumulator: any, obj: any) => accumulator + Number(obj.price),
    0,
  );
};

function hasCaseInsensitiveProperty(obj: any, prop: any) {
  let lowercaseProp = prop.toLowerCase();
  for (let key in obj) {
    if (
      key.toLowerCase() === lowercaseProp &&
      Object.prototype.hasOwnProperty.call(obj, key)
    ) {
      return true;
    }
  }

  return false;
}
const TimeProps = {
  showTime: { showSecond: false },
  format: 'YYYY-MM-DD HH:mm',
  inputReadOnly: true,
  onchange: (e) => {
    console.log(e);
  },
};
function validateContent(_: any, value: any) {
  if (!value) return Promise.reject('请输入');
  let iconRule =
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
  if (iconRule.test(value)) {
    return Promise.reject('不能输入表情符');
  }
  return Promise.resolve();
}
export {
  ErrorCodeMap,
  InputNumberFormatter,
  LowercaseLetters,
  TimeProps,
  UppercaseLetters,
  base642File,
  byte2string,
  createClipboard,
  delError,
  dowloadFile,
  entities2Utf16,
  file2arrayBuffer,
  file2base64,
  filterObject,
  formatDuration,
  formatDuration2Number,
  formatTime,
  getFileNameByUrl,
  getPrice,
  getProperty,
  getSourceNameByUrl,
  hasCaseInsensitiveProperty,
  index2XLSXIndex,
  isAvailableNumber,
  isObjectStict,
  isPromise,
  isStrictObject,
  isUnusableValue,
  isUsefulBasicType,
  keys2Options,
  link2file,
  loadImage,
  loadVideo,
  map2options,
  omitFormValue,
  pamap,
  parseQuery,
  pconnect,
  pmap,
  readXLSX,
  readZIP,
  record2QueryString,
  redirect2login,
  session,
  svg2imgSrc,
  toHourMinute,
  toMinute,
  url2Record,
  util_regexp,
  uuid,
  validateContent,
  writeXLSX,
};
