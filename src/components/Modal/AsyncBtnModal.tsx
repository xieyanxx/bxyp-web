import { useGetProp } from '@/hooks';
import { isStrictObject, uuid } from '@/utils';
import { useGetState } from 'ahooks';
import type { ButtonProps, ModalProps } from 'antd';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { omit } from 'lodash';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

export type ClickResType = Promise<boolean | void> | boolean | void;
export type AsyncBtnModalProps = {
  /**
   * @description: 按钮内容
   */
  btnContent?: React.ReactNode;
  btnType?: ButtonProps['type'];
  btnProps?: Omit<
    ButtonProps,
    'onClick' | 'onClickCapture' | 'type' | 'loading'
  > &
    React.RefAttributes<HTMLElement>;
} & Omit<
  ModalProps,
  'cancelButtonProps' | 'okButtonProps' | 'onOk' | 'onCancel' | 'closable'
> & {
    onClick?: (event: React.MouseEvent<HTMLElement>) => ClickResType;
    cancelButtonProps?: Omit<
      ModalProps['cancelButtonProps'],
      'loading' | 'disabled'
    >;
    okButtonProps?: Omit<ModalProps['okButtonProps'], 'loading'>;
    onOpenChange?: (open: boolean) => void;
    onOk?: (event: React.MouseEvent<HTMLElement>) => ClickResType;
    onCancel?: (event: React.MouseEvent<HTMLElement>) => ClickResType;
    /**
     * @name 可否关闭弹窗
     * @description 是boolean时只控制icon，对象时还能控制取消、确认按钮的disabled
     * @default undefined 默认行为和antd保持一致
     */
    closable?:
      | boolean
      | {
          icon?: boolean;
          mask?: boolean;
          keyboard?: boolean;
          cancel?: boolean;
          ok?: boolean;
        };
  };
export type AsyncBtnModalRefType = { toggle: (open: boolean) => void };

function AsyncBtnModal(
  {
    btnContent,
    btnType,
    btnProps,
    onClick,
    children,
    onOk,
    onCancel,
    okButtonProps,
    cancelButtonProps,
    bodyStyle,
    styles,
    maskClosable,
    keyboard,
    closable,
    width,
    wrapClassName,
    onOpenChange,
    ...restProps
  }: AsyncBtnModalProps,
  ref: React.Ref<AsyncBtnModalRefType>,
) {
  const getOnOk = useGetProp(onOk);
  const getOnClick = useGetProp(onClick);
  const getOnCancel = useGetProp(onCancel);
  const getOnOpenChange = useGetProp(onOpenChange);
  const bodyId = useRef('_' + uuid());
  const timer = useRef<NodeJS.Timeout>();
  const [btnLoading, setBtnLoading] = useState(false);
  const [modalLoading, setModalLoading, getModalLoading] = useGetState(false);
  const [open, setOpen, getOpen] = useGetState(false);
  useImperativeHandle(ref, () => ({ toggle }), []);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    getOnOpenChange()?.(open);
    if (open) {
      timer.current = setTimeout(() => {
        const body = document
          .querySelector('.' + bodyId.current)
          ?.querySelector('.ant-modal-body');
        body && (body.scrollTop = 0);
      });
    } else {
      clearTimeout(timer.current);
    }
  }, [open]);
  const clickHandle = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      if (!getOnClick()) {
        return setOpen(true);
      }
      setBtnLoading(true);
      const data = await getOnClick()(event);
      setBtnLoading(false);
      if (data === false || getOpen()) return;
      setOpen(true);
    },
    [],
  );
  /**
   * @name 外部开关modal
   */
  const toggle = useCallback(async (open: boolean) => {
    if (getModalLoading() || open === getOpen()) return;
    setOpen(open);
  }, []);
  const handleOk = useCallback(async (event: React.MouseEvent<HTMLElement>) => {
    if (getModalLoading()) return;
    setModalLoading(true);
    const data = await getOnOk()?.(event);
    setModalLoading(false);
    if (data === false || !getOpen()) return;
    setOpen(false);
  }, []);
  const handleCancel = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (getModalLoading()) return;
      setModalLoading(true);
      const data = await getOnCancel()?.(event);
      setModalLoading(false);
      if (data === false || !getOpen()) return;
      setOpen(false);
    },
    [],
  );
  const computedMC = useMemo(
    () =>
      ![
        modalLoading === true,
        isStrictObject(closable) ? closable.mask === false : false,
        maskClosable === false,
      ].some((v) => v),
    [closable, modalLoading, maskClosable],
  );
  const computedKeyboard = useMemo(
    () =>
      ![
        modalLoading === true,
        isStrictObject(closable) ? closable.keyboard === false : false,
        keyboard === false,
      ].some((v) => v),
    [closable, modalLoading, keyboard],
  );
  const computedClosable = useMemo(
    () =>
      ![
        modalLoading === true,
        closable === false,
        isStrictObject(closable) ? closable.icon === false : false,
      ].some((v) => v),
    [closable, modalLoading],
  );
  const computedCD = useMemo(
    () =>
      [
        modalLoading === true,
        isStrictObject(closable) ? closable?.cancel === false : false,
      ].some((v) => v),
    [modalLoading, closable],
  );
  const computedOD = useMemo(
    () =>
      [
        okButtonProps?.disabled === true,
        modalLoading === true,
        isStrictObject(closable) ? closable?.ok === false : false,
      ].some((v) => v),
    [modalLoading, closable, okButtonProps],
  );

  return (
    <>
      <Button
        {...omit(btnProps, ['children'])}
        type={btnType}
        onClick={clickHandle}
        loading={btnLoading}
      >
        {btnContent ?? btnProps?.children}
      </Button>
      <Modal
        wrapClassName={classNames(bodyId.current, wrapClassName)}
        width={width ?? '60vw'}
        {...restProps}
        styles={{
          body: {
            maxHeight: '60vh',
            overflow: 'hidden auto',
            ...bodyStyle,
          },
        }}
        open={open}
        maskClosable={computedMC}
        keyboard={computedKeyboard}
        closable={computedClosable}
        cancelButtonProps={{
          ...omit(cancelButtonProps, [
            'onClick',
            'onClickCapture',
            'loading',
            'disabled',
          ]),
          disabled: computedCD,
        }}
        okButtonProps={{
          ...omit(okButtonProps, ['onClick', 'onClickCapture', 'loading']),
          disabled: computedOD,
          loading: modalLoading,
        }}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {children}
      </Modal>
    </>
  );
}

/**
 * @name 按钮（有异步事件）和modal组合
 * @description 点击按钮有异步请求，如果点击事件返回false不会打开modal，会处理按钮loading；modal的开关也通过异步函数返回值决定，会处理modal按钮加载状态，加载中不可关闭modal
 */
export default memo(forwardRef(AsyncBtnModal)) as (
  props: AsyncBtnModalProps & { ref?: React.Ref<AsyncBtnModalRefType> },
) => JSX.Element;
