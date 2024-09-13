import type { AsyncBtnModalProps } from '@/components/Modal/AsyncBtnModal';
import { isStrictObject, omitFormValue } from '@/utils';
import type { ProFormInstance, ProFormProps } from '@ant-design/pro-components';
import { ButtonProps } from 'antd';
import { set, unset } from 'lodash';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import React, { createContext } from 'react';

type NamePath = string | number | (number | string)[];
type CommonProps = {
  /**
   * @name 提交后是否过滤表单值
   * @default true
   * @description 递归删除对象键值是''、undefined、null、NaN的键，
   * @description 表单输入框的清理键只会重置表单值成''，而不是清除表单值
   */
  filterValues?: boolean;
  btnContent?: React.ReactNode;
  btnType?: ButtonProps['type'];
  title?: React.ReactNode;
  btnProps?: Omit<ButtonProps, 'loading' | 'children' | 'type'>;
  onCancle?: AsyncBtnModalProps['onCancel'];
  modalProps?: Omit<
    AsyncBtnModalProps,
    | 'btnContent'
    | 'btnType'
    | 'btnProps'
    | 'onOk'
    | 'title'
    | 'onOpenChange'
    | 'forceRender'
    | 'onCancel'
    | 'destroyOnClose'
  >;
  /**
   * @name 每次打开弹窗都会重置表单，有返回值才会回填
   */
  getValues?: () => any;
  /**
   * @name modal开关回调
   */
  onOpenChange?: (open: boolean) => void;
} & Omit<
  ProFormProps,
  | 'name'
  | 'submitter'
  | 'form'
  | 'fromRef'
  | 'onFinish'
  | 'onFinishFailed'
  | 'initialValues'
  | 'request'
>;
type FormsContextType<
  V extends Record<string, any> = Record<string, any>,
  F extends NestedForms = NestedForms,
> = {
  manager: NestedFormsManager<V, F>;
};

type ValidateErrorInfo = ValidateErrorEntity & { formName: NamePath };
type NestedFormRef<T = NestedForms> = {
  getForm: () => ProFormInstance;
  getForms: () => T;
  toggleOpen: (open: boolean) => void;
  manager: NestedFormsManager;
};
type ChildFormRef = { getForm: () => ProFormInstance };
interface NestedForms {
  [k: string]: ProFormInstance | ProFormInstance[] | NestedForms;
}
interface NestedResets<T = () => void> {
  [k: string]: T | T[] | NestedResets;
}

type NestedModalFormsProps<T = Record<string, any>> = React.PropsWithChildren<
  {
    /**
     * @name 编辑状态
     * @description 会改标题
     */
    isEdit?: boolean;
    /**
     * @name 表单名
     */
    formName: string;
    /**
     * @name 提交失败
     * @description 有一个表单失败就会触发
     * @description 显示的返回true才会关闭modal，默认不关
     */
    onFinishFailed?: (errorInfo: ValidateErrorInfo) => Promise<boolean | void>;
    /**
     * @name 提交成功
     * @description 全部表单校验成功才会触发
     * @description 显示的返回false不会关闭modal，默认关闭
     * @param {Record<string, any>} info 全部表单值，值可能是values或者Array<values>
     */
    onFinish?: (info: T) => Promise<boolean | void>;
    /**
     * @name 打开主弹窗是否自动重置全部表单，或者自定义重置方法
     * @default true
     * @description 在有条件渲染子表单时，要按顺序重置这就需要自定义
     */
    autoResetForms?: ((manager: NestedFormsManager) => void) | boolean;
  } & CommonProps
>;
type CMFPropsType<T = any> = React.PropsWithChildren<
  {
    isEdit?: boolean;
    /**
     * @name 表单名
     */
    name: NamePath;
    /**
     * @name 提交失败
     * @description 显示的返回true才会关闭modal，默认不关
     */
    onFinishFailed?: (
      errorInfo: ValidateErrorEntity,
    ) => Promise<boolean | void>;
    /**
     * @name 提交成功
     * @description 显示的返回false不会关闭modal，默认关闭
     */
    onFinish?: (values: T) => Promise<boolean | void>;
  } & CommonProps
>;

/**
 * @name 嵌套表单状态管理
 * @attention FormList中的表单传[name,index]和传[name,index,subName]是不一样的结构，前者：这个list只有一个子表单，后者：这个list可以有多个子表单
 */
class NestedFormsManager<
  V extends Record<string, any> = Record<string, any>,
  F extends NestedForms = NestedForms,
> {
  /**
   * @name 主表单名
   * @description 只要绑定了一定有值
   */
  mainFormName?: string;
  /**
   * @name 等待子表单渲染后继续重置的时间，ms
   */
  waitResetTime = 300;
  #resetTimer?: NodeJS.Timeout;
  #restartReset: (() => void) | null = null;
  #forms: F = {} as F;
  /**
   * @name 全部表单的重置方法
   */
  #resets: Map<ProFormInstance, [NamePath, () => void]> = new Map();
  /**
   * @name 已经在上一轮渲染后重置过的表单，在等待结束后会被重置
   */
  #reseted: Map<ProFormInstance, () => void> = new Map();
  #values: V = {} as V;
  #infos: Map<ProFormInstance, NamePath> = new Map();

  /**
   * @name 存放全部表单提交后的回调
   */
  #submitCallbacks: {
    resolve: ((name: NamePath, value: any) => void) | null;
    reject: ((name: NamePath, error: any) => void) | null;
  } = {
    resolve: null,
    reject: null,
  };
  /**
   * @name 表单层级
   * @description 按照表单名长度排列的数组，主表单必定在第一位
   * @description 麻烦的是怎么定义表单层级
   */
  get formTiers() {
    return [...this.#infos]
      .reduce((pre, [form, name]) => {
        let index = Array.isArray(name)
          ? name.length
          : name === this.mainFormName
          ? 0
          : 1;
        if (!pre[index]) {
          pre[index] = [];
        }
        pre[index].push([form, name]);
        return pre;
      }, [] as [ProFormInstance, NamePath][][])
      .filter((_) => _);
  }
  constructor() {
    this.registerForm = this.registerForm.bind(this);
    this.unregisterForm = this.unregisterForm.bind(this);
    this.destory = this.destory.bind(this);
    this.validate = this.validate.bind(this);
    this.resetForms = this.resetForms.bind(this);
  }
  /**
   * @name 当前已渲染表单的重置方法
   */
  get resets() {
    return this.#resets;
  }
  /**
   * @name 已渲染的全部表单
   */
  get forms() {
    return this.#forms;
  }
  /**
   * @name 主表单
   */
  get mainForm() {
    return this.mainFormName
      ? (this.#forms[this.mainFormName] as ProFormInstance)
      : undefined;
  }
  /**
   * @name 表单提交成功
   */
  get submitSuccess() {
    return this.#submitCallbacks.resolve;
  }
  /**
   * @name 表单提交失败
   */
  get submitFaile() {
    return this.#submitCallbacks.reject;
  }
  get submitCallbacks() {
    return this.submitCallbacks;
  }
  /**
   * @name 注册表单
   */
  registerForm(name: NamePath, form: ProFormInstance) {
    set(this.#forms, name, form);
    this.#infos.set(form, name);
  }
  /**
   * @name 卸载表单
   */
  unregisterForm(name: NamePath, form: ProFormInstance) {
    unset(this.#forms, name);
    this.#infos.delete(form);
  }
  /**
   * @name 注册表单重置方法
   * @description 打开主表单modal时会重置全部表单
   */
  registerReset(form: ProFormInstance, name: NamePath, rest: () => void) {
    this.#resets.set(form, [name, rest]);
    if (!this.#restartReset) return;
    clearTimeout(this.#resetTimer);
    this.#resetTimer = setTimeout(() => {
      this.#restartReset?.();
    }, this.waitResetTime);
  }
  /**
   * @name 卸载表单重置方法
   */
  unregisterReset(form: ProFormInstance) {
    this.#resets.delete(form);
  }
  /**
   * @name 提交全部表单
   * @description 按照层级提交，全部表单验证成功提交最终values，一个表单失败立即reject但是剩余表单依旧会校验
   */
  submit() {
    return new Promise<V>((resolve, reject) => {
      const forms = this.formTiers.flat();
      const length = forms.length;
      let sum = 0;
      Promise.series(
        this.formTiers.map(
          (data) => () => Promise.all(data.map(([form]) => form.submit())),
        ),
      );
      this.#submitCallbacks.resolve = (name: NamePath, value: any) => {
        set(this.#values, name, value);
        if (++sum === length) {
          resolve(this.#values);
          this.#values = {} as V;
          this.#submitCallbacks.resolve = null;
          this.#submitCallbacks.reject = null;
        }
      };
      this.#submitCallbacks.reject = (name: NamePath, error: any) => {
        if (error instanceof Error) {
          (error as any).formName = name;
        } else if (isStrictObject(error)) {
          error.formName = name;
        }
        reject(error);
        this.#values = {} as V;
        this.#submitCallbacks.resolve = null;
        this.#submitCallbacks.reject = null;
      };
    });
  }
  /**
   * @name 校验全部表单并返回全部值
   * @description 应该等全部需要的表单都渲染完成才调用，此方法只会校验调用时已注册的表单
   * @description 只要失败一个就会全部失败，并返回已校验通过表单的值
   * @description 失败时，可以通过error.formName拿到表单名
   * @param [filter=true] 返回过滤无效值的value还是原始value
   * @return {Promise<V>}
   */
  validate(filter: boolean = true) {
    const values = {} as V;
    return Promise.all(
      this.formTiers.flat().map(([form, name]) =>
        form
          .validateFieldsReturnFormatValue()
          .then((value) => {
            set(values, name, value);
          })
          .catch((error) => {
            if (error instanceof Error) {
              (error as any).formName = name;
            } else if (isStrictObject(error)) {
              error.formName = name;
            }
            throw error;
          }),
      ),
    ).then(() => (filter ? omitFormValue(values) : values));
  }
  /**
   * @name 打开主表单modal时重置全部表单
   * @description 想要重置全部表单，就要等已渲染表单重置完成，等子表单渲染完成后重置子表单。
   * @description 而且这一切的前提是，表单的渲染只跟渲染有关，中间没插入其他异步逻辑，因为，这里只是简单的使用setTimeout等待渲染结束
   */
  resetForms() {
    return new Promise<void>((resolve) => {
      if (this.#resetTimer !== undefined) {
        clearTimeout(this.#resetTimer);
        this.#reseted.clear();
      }
      this.#restartReset = () => {
        const tasks = [...this.#resets].reduce((pre, [form, [, reset]]) => {
          if (this.#reseted.has(form)) {
            return pre;
          }
          pre.push([form, reset]);
          return pre;
        }, [] as [ProFormInstance, () => void][]);
        tasks.forEach(([form, reset]) => {
          reset();
          this.#reseted.set(form, reset);
        });
        this.#resetTimer = setTimeout(() => {
          this.#resetTimer = undefined;
          this.#reseted.clear();
          this.#restartReset = null;
          resolve();
        }, this.waitResetTime);
      };
      this.#restartReset();
    });
  }
  /**
   * @name 手动清除变量引用
   */
  destory() {
    this.#forms = {} as F;
    this.#values = {} as V;
    this.#infos.clear();
    this.#resets.clear();
    this.#reseted.clear();
    this.#submitCallbacks.reject = null;
    this.#submitCallbacks.resolve = null;
    if (this.#resetTimer !== undefined) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = undefined;
    }
  }
}

const FormsContext = createContext<FormsContextType>({} as any);

export { FormsContext, NestedFormsManager };
export type {
  CMFPropsType,
  ChildFormRef,
  FormsContextType,
  NamePath,
  NestedFormRef,
  NestedForms,
  NestedModalFormsProps,
  NestedResets,
  ValidateErrorInfo,
};
