import { useCallback, useRef, useState } from 'react';

/**
 * @name 自带处理状态和结果状态的异步回调钩子
 * @description fetcher resolve的是data，reject的是error
 */
function useRequest<T, P>(params: P, fetcher: (data: P) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const fetchRef = useRef(fetcher);
  const paramsRef = useRef(params);
  loadingRef.current = loading;
  fetchRef.current = fetcher;
  const getLoading = useCallback(() => loadingRef.current, []);
  const getFetcher = useCallback(() => fetchRef.current, []);
  const getParams = useCallback(() => paramsRef.current, []);
  const request = useCallback(async () => {
    if (getLoading()) return;
    setLoading(true);
    try {
      setData(await getFetcher()(getParams()));
    } catch (error) {
      setError(error ?? new Error('empty error'));
    }
    setLoading(false);
  }, []);
  return { loading, setLoading, getLoading, request, data, error };
}

export { useRequest };
