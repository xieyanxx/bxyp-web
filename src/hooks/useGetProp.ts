import { useCallback, useRef } from 'react';

/**
 * @name 单个prop/state的getter
 */
export function useGetProp<T>(prop: T) {
  const ref = useRef<{ value: T }>({ value: prop });
  ref.current.value = prop;
  return useCallback(() => ref.current.value, []);
}
