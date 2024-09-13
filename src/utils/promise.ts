/**
 * @description 粗略判断目标是不是 Promise
 */
function isPromise<T = any>(data: any): data is Promise<T> {
  return typeof data?.then === 'function' && typeof data?.catch === 'function';
}

/**
 * @description 如果目标 promise 是 Promise 会在 then 时执行 resolve，catch 时执行 reject，否则直接 resolve 结果
 */
function runPromiseOrReturnRes<T = any>(
  promise: T | Promise<T>,
  resolve: (result: T) => void,
  reject: (error: any) => void,
) {
  if (isPromise(promise)) {
    promise.then(resolve).catch(reject);
  } else {
    resolve(promise);
  }
}

/**
 * @description 异步任务按顺序逐个执行，全部完成后返回全部结果。
 */
function series<T = any>(tasks: Array<(index: number) => T | Promise<T>>) {
  return new Promise<T[]>((resolve, reject) => {
    const result: T[] = [];
    let index = 0;
    if (!tasks.length) {
      return resolve(result);
    }
    function callback(res: T) {
      result.push(res);
      if (index === tasks.length - 1) {
        return resolve(result);
      }
      ++index;
      tool();
    }
    function tool() {
      runPromiseOrReturnRes(tasks[index](index), callback, reject);
    }
    tool();
  });
}

/**
 * @description 异步任务逐个执行，每个任务会接收上个任务的执行结果和序号为参数，可以设置初始值，全部完成后返回全部结果。
 */
function reduce<T = any, P = any>(
  tasks: Array<(index: number, preValue?: T | P) => T | Promise<T>>,
  preValue?: P,
) {
  return new Promise<T[]>((resolve, reject) => {
    const result: T[] = [];
    let index = 0;
    if (!tasks.length) {
      return resolve(result);
    }
    function callback(res: T) {
      result.push(res);
      if (index === tasks.length - 1) {
        return resolve(result);
      }
      ++index;
      tool();
    }
    function tool() {
      runPromiseOrReturnRes(
        tasks[index](index, index === 0 ? preValue : result[index - 1]),
        callback,
        reject,
      );
    }
    tool();
  });
}

/**
 * @description 按固定任务数量并发，逐批次完成任务，全部完成后返回全部结果
 */
function batch<T = any>(
  count: number,
  tasks: Array<(index: number, batchIndex: number) => T | Promise<T>>,
) {
  return new Promise<T[]>((resolve, reject) => {
    if (
      typeof count !== 'number' ||
      Number.isNaN(count) ||
      count < 1 ||
      Math.floor(count) !== count ||
      !Number.isFinite(count)
    ) {
      return reject(
        new Error("The first parameter isn't a finite and positive integer"),
      );
    }
    const result: T[] = [];
    const length = Math.ceil(tasks.length / count);
    if (!length) {
      return resolve(result);
    }
    function tool(index: number) {
      const curTasks = tasks
        .slice(index * count, (index + 1) * count)
        .map((fn, i) => fn(index * count + i, index));
      Promise.all(curTasks)
        .then((data) => {
          result.push(...data);
          if (index === length - 1) {
            resolve(result);
          } else {
            tool(index + 1);
          }
        })
        .catch(reject);
    }
    tool(0);
  });
}

/**
 * @description 按照指定数量同时启动第一批，每个任务完成后启动一个剩余任务，直至全部完成返回全部结果。
 */
function outburst<T = any>(
  count: number,
  tasks: Array<(index: number) => T | Promise<T>>,
) {
  return new Promise<T[]>((resolve, reject) => {
    if (
      typeof count !== 'number' ||
      Number.isNaN(count) ||
      count < 1 ||
      Math.floor(count) !== count ||
      !Number.isFinite(count)
    ) {
      return reject(
        new Error("The first parameter isn't a finite and positive integer"),
      );
    }
    const result: T[] = [];
    if (!tasks.length) {
      return resolve(result);
    }
    let index = 0;
    let rejectd = false;
    let resolved = 0;
    function delErr(error: any) {
      rejectd = true;
      reject(error);
    }
    function callback(res: T, i: number) {
      if (rejectd) return;
      result[i] = res;
      ++resolved;
      if (resolved === tasks.length) {
        resolve(result);
      } else if (index < tasks.length) {
        tool(index);
      }
    }
    function tool(i: number) {
      ++index;
      try {
        const promise = tasks[i](i);
        if (isPromise(promise)) {
          promise.then((res) => callback(res, i)).catch(delErr);
        } else {
          callback(promise, i);
        }
      } catch (error) {
        delErr(error);
      }
    }
    tasks.slice(0, count).map((_, i) => tool(i));
  });
}

Object.defineProperties(Promise, {
  series: {
    value: series,
  },
  reduce: {
    value: reduce,
  },
  batch: {
    value: batch,
  },
  outburst: {
    value: outburst,
  },
});
