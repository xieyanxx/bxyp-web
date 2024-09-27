declare module '*.css';
declare module '*.jpg';
declare module '*.png';
declare module '*.gif';
declare module '*.less';
declare module '*.json';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.xlsx';
declare module '*.csv';
declare module 'mapbox-gl';
declare const ENV: string;
declare const ADMIN_URL: string;
declare const API_URL: string;
declare const DDLogin: any;
declare const API_HOST: string;
declare const BUILD_TARGET: string;
declare module 'lodash';
declare module 'store';
declare module 'jsonwebtoken'

declare module 'eruda' {
  export function init(): void;
}
interface Window {
  // 字段缺失显示“-”
  DefText: string;
  // video.js
  HELP_IMPROVE_VIDEOJS: boolean;
  googleTranslateElementInit: () => void;
  qq: any;
}
/**
 * 后端分页接口通用返回体格式，不是这个格式的让后端改接口
 */
declare type RawRequestListData<T = any> = {
  content: T[];
  // size: number;
  totalElements: number;
  // totalPages: number;
};

declare type RequestListParams<T extends Record<string, any>> = {
  page: number;
  size: number;
} & T;

/**
 * pro-table的request返回体
 */
declare type RequestListData<T = any> = Promise<
  { data: T[]; success?: boolean; total?: number } & Record<string, any>
>;

/**
 * 后端分页接口通用参数格式，page从0开始，接口层默认是0
 */
declare type PagingParams<
  T extends Record<string, any> = Record<string, unknown>,
> = {
  pageNumber: number;
  pageSize: number;
} & T;

/**
 * pro-table参数格式
 */
declare type PagingArgs<
  T extends Record<string, any> = Record<string, unknown>,
> = {
  current?: number;
  pageSize?: number;
} & T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare type ErreyOneLikeItem<T extends any[]> = T['length'] extends 0
  ? never
  : T[0];
declare interface WindowEventMap {
  localStorageChange: CustomEvent<{
    oldValue: Record<string, string | undefined>;
    newValue: Record<string, string | undefined>;
  }>;
  sessionStorageChange: CustomEvent<{
    oldValue: Record<string, string | undefined>;
    newValue: Record<string, string | undefined>;
  }>;
  selectMenuTreeItem: CustomEvent<{ id: string; data?: Record<string, any> }>;
  DebounceResize: CustomEvent<void>;
  GoogleTranslateElementInit: CustomEvent<void>;
}

declare enum ShapeSize {
  xs = 'xs',
  s = 's',
  m = 'm',
  sm = 'sm',
  md = 'md',
  l = 'l',
  lg = 'lg',
  xl = 'xl',
  xxl = 'xxl',
  custom = 'custom',
}

type PickShapeSize<T extends keyof typeof ShapeSize> = keyof Pick<
  typeof ShapeSize,
  T
>;
/**
 * @description 更新或者新增数据接口参数类型，过滤掉非必要属性
 */
type UpdateRecord<
  T extends Record<string, any> = Record<string, any>,
  P extends string | number = number,
> = Omit<T, 'id' | 'operator' | 'operationTime' | 'rowKey'> & { id?: P };
declare namespace google.translate {
  export const TranslateElement: any;
}

/**
 * 拓展Promise
 */
declare interface PromiseConstructor {
  /**
   * @description 异步任务按顺序逐个执行，全部完成后返回全部结果。
   */
  series: <T = any>(
    tasks: Array<(index: number) => T | Promise<T>>,
  ) => Promise<T[]>;
  /**
   * @description 异步任务按顺序逐个执行，全部完成后返回全部结果。
   */
  reduce: <T = any>(
    tasks: Array<(index: number, preValue?: T) => T | Promise<T>>,
    preValue?: T,
  ) => Promise<T[]>;
  /**
   * @description 按固定任务数量并发，逐批次完成任务，全部完成后返回全部结果
   */
  batch: <T = any>(
    count: number,
    tasks: Array<(index: number, batchIndex: number) => T | Promise<T>>,
  ) => Promise<T[]>;
  /**
   * @description 按照指定数量同时启动第一批，每个任务完成后启动一个剩余任务，直至全部完成返回全部结果。
   */
  outburst: <T = any>(
    count: number,
    tasks: Array<(index: number) => T | Promise<T>>,
  ) => Promise<T[]>;
}

/**
 * @name 提取数组成员类型
 */
declare type ArrayItemType<T> = T extends Array<infer R> ? R : never;

/**
 * @name 从React.Ref<T>提取出T
 */
declare type PickRefGenericity<T> = T extends (current: infer A) => void
  ? A
  : T extends { current: infer A }
  ? A
  : never;

/**
 * @name 插入参数，不改变返回类型
 */
declare type InsertArgs<
  Func extends (...args: any) => any,
  Args extends any[],
> = Func extends (...args: infer A) => infer R
  ? (...args: [...Args, ...A]) => R
  : never;

/**
 * @name 追加参数，不改变返回类型
 */
declare type AppendArgs<
  Func extends (...args: any) => any,
  Args extends any[],
> = Func extends (...args: infer A) => infer R
  ? (...args: [...A, ...Args]) => R
  : never;

/**
 * @name 只输出字符key
 * @description 默认的keyof会推导出key是数字的字面量对象的key是数字，避免这个问题
 */
declare type StringifyKeyofMap<
  T extends Record<PropertyKey, any>,
  P extends Exclude<keyof T, symbol> = Exclude<keyof T, symbol>,
> = P extends number ? `${P}` : P;

/**
 * @name 全部小写英文字母
 */
declare type LowercaseLetters =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

/**
 * @name 全部大写英文字母
 */
declare type UpercaseLetters = Uppercase<LowercaseLetters>;

/**
 * @name 全部英文字母
 */
declare type AllLetters = LowercaseLetters | UpercaseLetters;

/**
 * @name 小驼峰命名法改成短横线命名法
 * @description 别传P
 */
declare type Came2KebabCase<
  T extends string,
  P extends string = '',
> = T extends ''
  ? P
  : T extends `${infer S}${infer R}`
  ? S extends AllLetters
    ? S extends Uppercase<S>
      ? P extends ''
        ? Came2KebabCase<R, Lowercase<S>>
        : Came2KebabCase<R, `${P}-${Lowercase<S>}`>
      : Came2KebabCase<R, `${P}${S}`>
    : Came2KebabCase<R, `${P}${S}`>
  : T;

/**
 * @name 小驼峰命名法改成短横线命名法
 * @description 别传P
 */
declare type Came2SankeCase<
  T extends string,
  P extends string = '',
> = T extends ''
  ? P
  : T extends `${infer S}${infer R}`
  ? S extends AllLetters
    ? S extends Uppercase<S>
      ? P extends ''
        ? Came2SankeCase<R, Lowercase<S>>
        : Came2SankeCase<R, `${P}_${Lowercase<S>}`>
      : Came2SankeCase<R, `${P}${S}`>
    : Came2SankeCase<R, `${P}${S}`>
  : T;

/**
 * @name 提取React.Ref的泛型
 */
declare type PickReactRef<T> = T extends (instance: infer P) => void
  ? Exclude<P, null>
  : T extends { current: infer Q }
  ? Exclude<Q, null>
  : T;

declare type OptionItem<T extends number | string> = {
  value: T;
  label: string;
};
/**
 * @name 下拉选项
 */
declare type Options<T extends number | string = number> = OptionItem<T>[];
