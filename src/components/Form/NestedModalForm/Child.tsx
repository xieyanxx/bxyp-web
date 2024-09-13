import { AsyncBtnModal } from '@/components/Modal';
import { useGetProp } from '@/hooks';
import { omitFormValue } from '@/utils';
import { ProForm, ProFormInstance } from '@ant-design/pro-components';
import { message } from 'antd';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import React, {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { CMFPropsType, ChildFormRef, FormsContext } from './utils';

function CMF<T = any>(
  {
    layout = 'horizontal',
    filterValues = true,
    btnType,
    title,
    btnContent,
    isEdit,
    name,
    modalProps,
    btnProps,
    children,
    onCancle,
    getValues,
    onFinish,
    onFinishFailed,
    onOpenChange,
    ...formProps
  }: CMFPropsType<T>,
  ref: React.Ref<ChildFormRef>,
) {
  const { manager } = useContext(FormsContext);
  const getName = useGetProp(name);
  const getGetValues = useGetProp(getValues);
  const getOnFinish = useGetProp(onFinish);
  const getOnFinishFailed = useGetProp(onFinishFailed);
  const getFilterValues = useGetProp(filterValues);
  const form = useRef<ProFormInstance>(null);
  const callbacks = useRef<(status: boolean) => void>(null);
  useImperativeHandle(ref, () => ({ getForm: () => form.current }), []);
  /**
   * @name 重置表单
   */
  const reset = useCallback(() => {
    form.current?.resetFields();
    const values = getGetValues()?.();
    values && form.current?.setFieldsValue(values);
  }, []);
  useEffect(() => {
    if (!form.current) {
      return message.error('子表单未及时注册，请及时修复BUG');
    }
    manager.registerForm(name, form.current);
    manager.registerReset(form.current, name, reset);
    return () => {
      manager.unregisterForm(name, form.current);
      manager.unregisterReset(form.current);
    };
  }, [name]);
  const clearCallbacks = useCallback(() => {
    callbacks.current = null;
  }, []);
  /**
   * @name 触发表单验证
   */
  const onOk = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      callbacks.current = resolve;
      form.current.submit();
    }).then((res) => (clearCallbacks(), res));
  }, []);
  const handleSubmit = useCallback(async (values: any) => {
    manager.submitSuccess?.(
      getName(),
      getFilterValues() ? omitFormValue(values) : values,
    );
    let status = await getOnFinish()?.(values);
    if (status !== false) {
      status = true;
    }
    callbacks.current?.(status);
    clearCallbacks();
  }, []);
  const handleFailed = useCallback(async (errorInfo: ValidateErrorEntity) => {
    manager.submitFaile?.(getName(), errorInfo);
    let status = await getOnFinishFailed()?.(errorInfo);
    if (status !== true) {
      status = false;
    }
    callbacks.current?.(status);
    clearCallbacks();
  }, []);
  return (
    <AsyncBtnModal
      btnProps={btnProps}
      btnContent={btnContent ?? (isEdit ? '编辑' : '新增')}
      btnType={btnType ?? (isEdit ? 'default' : 'primary')}
      title={title ?? (isEdit ? '编辑' : '新增')}
      {...modalProps}
      onCancel={onCancle}
      onOk={onOk}
      onOpenChange={onOpenChange}
      forceRender
    >
      <ProForm
        layout={layout}
        {...formProps}
        submitter={false}
        onFinish={handleSubmit}
        onFinishFailed={handleFailed}
        formRef={form}
      >
        {children}
      </ProForm>
    </AsyncBtnModal>
  );
}

/**
 * @name 子表单，自动处理表单提交、校验
 * @description 使用Form.List时注意formName
 */
export default memo(forwardRef(CMF)) as (
  props: CMFPropsType & { ref?: React.Ref<ChildFormRef> },
) => JSX.Element;
