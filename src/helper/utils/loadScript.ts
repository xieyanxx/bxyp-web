/*
 * @Author: Lear
 * @Date: 2021-11-17 16:39:07
 * @Description:
 */
import loadjs, { LoadOptions } from 'loadjs';
import _isString from 'lodash/isString';

const LoadScriptCache: Record<string, Promise<any>> = {};

interface CacheOptions extends LoadOptions {
  enableCache?: boolean;
}

/**
 * @description 动态加载脚本
 * @param {src: string; options: CacheOptions; }
 * @return {*} Promise
 */
export default (src: string, options: CacheOptions = {}): Promise<any> => {
  if (!_isString(src)) {
    throw new Error('src is not string');
  }
  const opts: CacheOptions = {
    enableCache: true,
    numRetries: 3,
    ...options,
  };

  let promise = LoadScriptCache[src];

  // 如果存在且使用缓存，直接返回缓存的Promise
  if (opts.enableCache && promise) {
    return promise;
  }

  promise = loadjs([src], {
    ...opts,
    returnPromise: true,
  });

  if (opts.enableCache) {
    LoadScriptCache[src] = promise;
  }

  return promise;
};
