import { useGetState } from 'ahooks';
import type { ButtonProps, PopconfirmProps } from 'antd';
import { Button, Popconfirm } from 'antd';
import React, { memo, useCallback } from 'react';

type ConfirmButtonProps = React.PropsWithChildren<{
  popconfirmProps?: Omit<
    PopconfirmProps,
    'visible' | 'onConfirm' | 'onCancel' | 'okButtonProps' | 'title'
  > & {
    title?: PopconfirmProps['title'];
    okButtonProps?: Omit<PopconfirmProps['okButtonProps'], 'loading'>;
    cancelButtonProps?: Omit<PopconfirmProps['cancelButtonProps'], 'loading'>;
  };
  title?: PopconfirmProps['title'];
  onConfirm?: () => Promise<boolean> | boolean;
  onCancel?: () => void;
  buttonProps?: Omit<ButtonProps, 'onClick'>;
  onClickBtn?: () => Promise<boolean>;
}>;

const ConfirmButton = ({
  title = '请确认要执行此操作！',
  children,
  buttonProps,
  onCancel,
  onClickBtn,
  onConfirm,
  popconfirmProps,
}: ConfirmButtonProps) => {
  const [visible, setVisible, getVisible] = useGetState(false);
  const [loading, setLoading, getLoading] = useGetState(false);
  const clickBtn = useCallback(async () => {
    if (getVisible() || getLoading()) return;
    if (await onClickBtn?.()) {
      setVisible(true);
    } else {
      setVisible(true);
    }
  }, [onClickBtn]);
  const onOk = useCallback(async () => {
    if (getLoading()) return;
    setLoading(true);
    const res = (await onConfirm?.()) ?? true;
    setLoading(false);
    setVisible(!res);
  }, [onConfirm]);
  const onOff = useCallback(() => {
    if (!getLoading()) {
      setVisible(false);
      onCancel?.();
    }
  }, [onCancel]);
  return (
    <Popconfirm
      open={loading ? true : visible ? undefined : false}
      onConfirm={onOk}
      onCancel={onOff}
      okButtonProps={{ ...popconfirmProps?.okButtonProps, loading }}
      cancelButtonProps={{
        ...popconfirmProps?.cancelButtonProps,
        disabled: loading,
      }}
      {...popconfirmProps}
      title={title}
    >
      <Button danger {...buttonProps} onClick={clickBtn}>
        {children}
      </Button>
    </Popconfirm>
  );
};

export default memo(ConfirmButton);
