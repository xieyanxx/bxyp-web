import { Button } from 'antd';
import { omit } from 'lodash';
import React, { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import ModalForm from './ModalForm';
import type { BtnModalFormProps, ModalFormRefType } from './config';

/**
 * @description: 常见业务需求：一个按钮控制表单显隐，即可编辑也可新增
 */
function BtnModalForm<T extends Record<string, unknown> = Record<string, any>>(
  {
    size = 'l',
    title,
    isEdit,
    trigger,
    children,
    btnProps,
    formProps,
    modalProps,
    modalTitle,
    disabled = false,
    ...restProps
  }: BtnModalFormProps,
  ref: React.RefObject<ModalFormRefType<T>>,
) {
  const modalRef = useRef<ModalFormRefType<T>>(null);
  useImperativeHandle(ref, () => modalRef.current, []);
  return (
    <ModalForm<T>
      title={modalTitle ?? `${isEdit ? '编辑' : '新增'}${title ?? ''}`}
      size={size}
      ref={modalRef}
      trigger={
        trigger ?? (
          <Button
            disabled={disabled}
            type={isEdit ? 'default' : 'primary'}
            {...omit(btnProps, ['children'])}
          >
            {btnProps?.children ?? (isEdit ? '编辑' : '新增')}
          </Button>
        )
      }
      modalProps={omit(modalProps, [
        'trigger',
        'title',
        'size',
        'onVisibleChange',
        'children',
      ])}
      formProps={
        omit(formProps, ['onFinish', 'children', 'form', 'formRef']) as any
      }
      {...restProps}
    >
      {children}
    </ModalForm>
  );
}

export default memo(forwardRef(BtnModalForm)) as <
  Values extends Record<string, unknown> = Record<string, any>,
>(
  props: BtnModalFormProps<Values> & {
    ref?: React.Ref<ModalFormRefType<Values>>;
  },
) => React.ReactElement;
