import type { ModalProps } from 'antd';

export const ModalSizes = {
  l: { width: '70vw', minWidth: '1000px', maxHeight: '60vh' },
  m: { width: '60vw', minWidth: '600px', maxHeight: '60vh' },
  s: { width: '40vw', minWidth: '500px', maxHeight: '60vh' },
};
export type ModalSizesType = keyof typeof ModalSizes;
type ClickResType = Promise<boolean | void> | boolean | void;
export type TiggerModalProps = React.PropsWithChildren<{
  size?: ModalSizesType;
  /**
   * @description: 触发表单显示的组件，点击事件的返回结果可以控制modal显示。默认打开
   */
  trigger: React.ReactElement<{
    onClick?: (...agrs: any[]) => Promise<boolean>;
  }>;
  defaultVisible?: boolean;
  /**
   * @description: 刚加载那次不会触发
   */
  onVisibleChange?: (visible: boolean) => void;
}> &
  Omit<
    ModalProps,
    | 'okButtonProps'
    | 'cancelButtonProps'
    | 'onOk'
    | 'visible'
    | 'open'
    | 'onCancel'
  > & {
    onOk?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => ClickResType;
    onCancel?: (
      event: React.MouseEvent<HTMLElement, MouseEvent>,
    ) => ClickResType;
    okButtonProps?: Omit<
      ModalProps['okButtonProps'],
      'loading' | 'onClick' | 'onClickCapture'
    >;
    cancelButtonProps?: Omit<
      ModalProps['cancelButtonProps'],
      'loading' | 'disabled' | 'onClick' | 'onClickCapture'
    >;
  };
export type TiggerModalRefType = { changeVisible: (visible: boolean) => void };
