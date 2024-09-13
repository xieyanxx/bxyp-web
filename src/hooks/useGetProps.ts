import { upperFirst } from 'lodash';
import { useMemo, useRef } from 'react';

type CreateGetKey<T> = T extends `${infer F}${infer R}`
  ? `get${Uppercase<F>}${R}`
  : never;
type RecoverGetKey<T> = T extends `get${infer F}${infer R}`
  ? `${Lowercase<F>}${R}`
  : never;
type GetKeyMap<T, K extends keyof T = keyof T> = T extends Record<string, any>
  ? {
      [P in CreateGetKey<K>]: () => T[RecoverGetKey<P>];
    }
  : never;

/**
 * @name 多个prop/state的getter集合
 * @description useGetProp加强版，注意参数的key必须是纯字母的否则类型推导不一致
 */
function useGetProps<T extends Record<string, any> = Record<string, any>>(
  data: T = {} as T,
) {
  const ref = useRef<T>(data);
  Object.keys(data).forEach((key: Exclude<keyof T, number | symbol>) => {
    ref.current[key] = data[key];
  });
  return useMemo(
    () =>
      Object.keys(data).reduce(
        (pre, key: Exclude<keyof T, number | symbol>) => {
          pre[`get${upperFirst(key)}`] = () => ref.current[key];
          return pre;
        },
        {} as GetKeyMap<T>,
      ),
    [],
  );
}

export { useGetProps };
