import {
  ModalSizesType,
  TiggerModalProps,
  TiggerModalRefType,
} from '@/components/Modal';
import type { ProFormInstance, ProFormProps } from '@ant-design/pro-components';
import type { ProFormFieldItemProps } from '@ant-design/pro-form/es/typing';
import type { ButtonProps, InputProps } from 'antd';
import type { InputRef, PasswordProps } from 'antd/lib/input';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';

export type ModalFormProps<
  T extends Record<string, unknown> = Record<string, any>,
> = React.PropsWithChildren<{
  size?: ModalSizesType;
  title?: React.ReactNode;
  /**
   * @description 从源数据中获取表单values，打开modal时执行
   */
  getValues?: () => any | Promise<any>;
  /**
   * @description 可能表中还夹杂着其他内容需要重置，打开modal时执行
   */
  resetOthers?: () => void;
  /**
   * @description 关闭modal时执行
   */
  resetOnHidden?: () => void;
  onFinish?: (values: T) => Promise<boolean>;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<T>) => void;
  trigger: TiggerModalProps['trigger'];
  formProps?: Omit<
    ProFormProps<T>,
    'form' | 'children' | 'onFinish' | 'formRef' | 'onFinishFailed'
  >;
  modalProps?: Omit<
    TiggerModalProps,
    'children' | 'trigger' | 'onVisibleChange' | 'size' | 'title'
  >;
  onVisibleChange?: TiggerModalProps['onVisibleChange'];
  /**
   * @name 表单前自定义内容
   */
  prefixContent?: React.ReactNode;
  /**
   * @name 表单后自定义内容
   */
  suffixContent?: React.ReactNode;
}>;

export type ModalFormRefType<
  T extends Record<string, unknown> = Record<string, any>,
> = {
  form: ProFormInstance<T>;
} & TiggerModalRefType;

export type BtnModalFormProps<
  T extends Record<string, unknown> = Record<string, any>,
> = {
  size?: ModalSizesType;
  isEdit?: boolean;
  title?: string;
  onFinish?: (values: T) => Promise<boolean>;
  btnProps?: ButtonProps;
  modalTitle?: React.ReactNode;
  disabled?: boolean;
} & Omit<ModalFormProps<T>, 'trigger' | 'title'> & {
    trigger?: ModalFormProps<T>['trigger'];
  };

export type I18nTextProps = {
  text: ProFormFieldItemProps<InputProps, InputRef>['fieldProps'];
  textarea: ProFormFieldItemProps<PasswordProps, InputRef>['fieldProps'];
};
