import { AsyncBtnModal, AsyncBtnModalRefType } from '@/components/Modal';
import { useGetProp } from '@/hooks';
import { omitFormValue } from '@/utils';
import { ProForm, ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import { isFunction } from 'lodash';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  FormsContext,
  FormsContextType,
  NestedFormRef,
  NestedForms,
  NestedFormsManager,
  NestedModalFormsProps,
} from './utils';

function Main<
  T extends Record<string, any> = Record<string, any>,
  P extends NestedForms = NestedForms,
>(
  {
    layout = 'horizontal',
    filterValues = true,
    autoResetForms = true,
    title,
    btnType,
    btnContent,
    isEdit,
    formName,
    btnProps,
    modalProps,
    getValues,
    onOpenChange,
    onFinish,
    onFinishFailed,
    children,
    ...formProps
  }: NestedModalFormsProps<T>,
  ref: React.Ref<NestedFormRef<P>>,
) {
  const getName = useGetProp(formName);
  const getAutoResetForms = useGetProp(autoResetForms);
  const getOnOpenChange = useGetProp(onOpenChange);
  const getGetValues = useGetProp(getValues);
  const getOnFinish = useGetProp(onFinish);
  const getOnFinishFailed = useGetProp(onFinishFailed);
  const getFilterValues = useGetProp(filterValues);
  const form = useRef<ProFormInstance>(null);
  const manager = useRef(new NestedFormsManager<T, P>());
  const modal = useRef<AsyncBtnModalRefType>(null);
  /**
   * @name 重置子表单定时器
   */
  const childrenTimer = useRef<NodeJS.Timeout>();
  const reset = useCallback(() => {
    form.current.resetFields();
    const values = getGetValues()?.();
    values && form.current.setFieldsValue(values);
  }, []);
  const ctx = useMemo<FormsContextType<T, P>>(
    () => ({
      manager: manager.current,
    }),
    [],
  );
  useEffect(
    () => () => {
      clearTimeout(childrenTimer.current);
      manager.current.destory();
    },
    [],
  );
  useEffect(() => {
    manager.current.registerForm(formName, form.current);
    manager.current.registerReset(form.current, formName, reset);
    manager.current.mainFormName = formName;
    return () => {
      manager.current.unregisterForm(formName, form.current);
      manager.current.unregisterReset(form.current);
      delete manager.current.mainFormName;
    };
  }, [formName]);
  useImperativeHandle(
    ref,
    () => ({
      getForm: () => form.current,
      getForms: () => manager.current.forms as P,
      manager: manager.current,
      toggleOpen: (open: boolean) => modal.current.toggle(open),
    }),
    [],
  );
  /**
   * @name 提交表单
   * @description promise会被handleFailed和handleSubmit resolve
   * @description 非校验错误不会下放到onFinishFailed
   */
  const onOk = useCallback(() => {
    return manager.current
      .submit()
      .then(async (values) => (await getOnFinish()?.(values as T)) ?? true)
      .catch(async (error) => {
        if (!error?.formName) {
          message.error(`回调异常或组件异常：${error?.message ?? ''}`);
          return false;
        }
        const callback = getOnFinishFailed();
        if (!callback && error.formName !== getName()) {
          message.error(`表单${error.formName}校验失败`);
        }
        const status = (await callback?.(error)) ?? false;
        return status;
      });
  }, []);
  /**
   * @name 主表单验证失败
   * @description 会触发onFinishFailed
   */
  const handleFailed = useCallback(async (errorInfo: ValidateErrorEntity) => {
    manager.current.submitFaile?.(getName(), errorInfo);
  }, []);
  /**
   * @name 提交全部表单
   */
  const handleSubmit = useCallback(async (values: any) => {
    manager.current.submitSuccess?.(
      getName(),
      getFilterValues() ? omitFormValue(values) : values,
    );
  }, []);
  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      const reset = getAutoResetForms() ?? true;
      isFunction(reset)
        ? reset(manager.current)
        : reset
        ? manager.current.resetForms()
        : void 0;
    }
    getOnOpenChange()?.(open);
  }, []);
  return (
    <AsyncBtnModal
      ref={modal}
      btnProps={{ ...btnProps }}
      btnType={btnType ?? (isEdit ? 'default' : 'primary')}
      btnContent={btnContent ?? (isEdit ? '编辑' : '新增')}
      {...modalProps}
      title={title ?? (isEdit ? '编辑' : '新增')}
      onOk={onOk}
      onOpenChange={handleOpenChange}
      forceRender
    >
      <ProForm
        layout={layout}
        {...formProps}
        submitter={false}
        onFinishFailed={handleFailed}
        formRef={form}
        onFinish={handleSubmit}
      >
        <FormsContext.Provider value={ctx as any}>
          {children}
        </FormsContext.Provider>
      </ProForm>
    </AsyncBtnModal>
  );
}

/**
 * @name 一个按钮打开一个模态框主表单，嵌套其他模态框子表单
 * @description 子表单必须使用ChildBtnModalForm
 * @description 打开主弹窗时会重置全部表单，但有条件渲染子表单的场景需要自定义重置方法。
 */
export default memo(forwardRef(Main)) as <
  Values = Record<string, any>,
  Forms = NestedForms,
>(
  props: NestedModalFormsProps<Values> & {
    ref?: React.Ref<NestedFormRef<Forms>>;
  },
) => JSX.Element;
