import { useGetProp } from '@/hooks';
import { useGetState, useUpdateEffect } from 'ahooks';
import { Modal } from 'antd';
import { omit } from 'lodash';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import type { TiggerModalProps, TiggerModalRefType } from './config';
import { ModalSizes } from './config';

/**
 * @description 触发器打开一个modal
 * * trigger可以有onClick事件,返回true会打开modal，返回false不会打开，没onClick事件默认打开modal。
 * * 过滤了确认、取消按钮的onClick、onClickCapture事件，只能使用onOk和onCancel事件
 * * onOk后会进入loading状态，loading期间会禁用全部关闭途径。传了onOk返回true或者不传onOk都关闭modal，返回false不关闭modal
 */
function TiggerModal(
  {
    size = 'l',
    onOk,
    style,
    trigger,
    onCancel,
    keyboard,
    closable,
    children,
    bodyStyle,
    maskClosable,
    okButtonProps,
    defaultVisible,
    onVisibleChange,
    cancelButtonProps,
    ...restProps
  }: TiggerModalProps,
  ref: React.Ref<TiggerModalRefType>,
) {
  const getOnOk = useGetProp(onOk);
  const getOnCancel = useGetProp(onCancel);
  const getOnVisibleChange = useGetProp(onVisibleChange);
  const [visible, setVisible] = useState(defaultVisible ?? false);
  const [loading, setLoading, getLoading] = useGetState(false);
  const button = useMemo(() => {
    return React.cloneElement(trigger, {
      ...trigger.props,
      onClick: async (...args: any[]) => {
        const res = await trigger.props.onClick?.(...args);
        setVisible(res === false ? false : true);
        return res;
      },
    });
  }, [trigger]);
  useImperativeHandle(
    ref,
    () => ({ changeVisible: (visible) => setVisible(visible) }),
    [],
  );
  useUpdateEffect(() => {
    getOnVisibleChange()?.(visible);
  }, [visible]);
  const handleOk = useCallback(
    async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (getLoading()) return;
      setLoading(true);
      const res = await getOnOk()?.(event);
      setLoading(false);
      setVisible(res === false ? true : false);
    },
    [],
  );
  const handleCancel = useCallback(
    async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (getLoading()) return;
      setLoading(true);
      const res = await getOnCancel()?.(event);
      setLoading(false);
      setVisible(res === false ? true : false);
    },
    [],
  );
  return (
    <>
      {button}
      <Modal
        width={ModalSizes[size]?.width}
        style={{ minWidth: ModalSizes[size]?.minWidth, ...style }}
        styles={{
          body: {
            overflow: 'hidden auto',
            ...bodyStyle,
          },
        }}
        open={visible}
        maskClosable={loading ? false : maskClosable}
        keyboard={loading ? false : keyboard}
        closable={loading ? false : closable}
        cancelButtonProps={{
          ...omit(cancelButtonProps, ['onClick', 'onClickCapture', 'loading']),
          disabled: loading,
        }}
        okButtonProps={{
          ...omit(okButtonProps, ['onClick', 'onClickCapture']),
          loading,
        }}
        destroyOnClose={true}
        onCancel={handleCancel}
        onOk={handleOk}
        {...restProps}
      >
        {children}
      </Modal>
    </>
  );
}

export default memo(
  forwardRef<TiggerModalRefType, TiggerModalProps>(TiggerModal),
);
