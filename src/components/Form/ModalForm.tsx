import { TiggerModalRefType, TriggerModal } from '@/components/Modal';
import { useGetProp } from '@/hooks';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProForm } from '@ant-design/pro-form';
import { useGetState } from 'ahooks';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { ModalFormProps, ModalFormRefType } from './config';

/**
 * @description: 如@ant-design/pro-form的ModalForm
 *
 */
function ModalForm<T extends Record<string, unknown> = Record<string, any>>(
  {
    size,
    title,
    trigger,
    children,
    onFinish,
    formProps,
    getValues,
    modalProps,
    resetOthers,
    prefixContent,
    suffixContent,
    onVisibleChange,
    onFinishFailed,
  }: ModalFormProps<T>,
  ref: React.RefObject<ModalFormRefType<T>>,
) {
  const getOnFinish = useGetProp(onFinish);
  const getGetValues = useGetProp(getValues);
  const getResetOthers = useGetProp(resetOthers);
  const getOnVisibleChange = useGetProp(onVisibleChange);
  const getOnFinishFailed = useGetProp(onFinishFailed);
  const [, setLoading, getLoading] = useGetState<boolean>();
  const modalRef = useRef<TiggerModalRefType>(null);
  const formRef = useRef<ProFormInstance<T>>(null);
  useImperativeHandle(
    ref,
    () => ({
      form: formRef.current,
      changeVisible: (visible) => modalRef.current?.changeVisible(visible),
    }),
    [],
  );
  const onOpenChange = useCallback(async (visible: boolean) => {
    if (getOnVisibleChange()) {
      return getOnVisibleChange()?.(visible);
    }
    if (visible) {
      setLoading(true);
      formRef.current?.resetFields();
      const values = await getGetValues()?.();
      if (values) {
        formRef.current.setFieldsValue(values as any);
      }
      getResetOthers()?.();
      setLoading(undefined);
    }
  }, []);
  const submit = useCallback(async () => {
    if (getLoading()) return false;

    const res = await formRef.current
      ?.validateFields()
      .then((values) => values)
      .catch((error) => {
        getOnFinishFailed()?.(error);
      });
    if (res) {
      return !!(await getOnFinish()?.(res));
    }
    return false;
  }, []);
  return (
    <TriggerModal
      forceRender
      {...modalProps}
      title={title}
      size={size}
      trigger={trigger}
      ref={modalRef}
      onVisibleChange={onOpenChange}
      onOk={submit}
    >
      {prefixContent}
      <ProForm<T>
        layout="horizontal"
        submitter={false}
        {...formProps}
        formRef={formRef}
      >
        {children}
      </ProForm>
      {suffixContent}
    </TriggerModal>
  );
}

export default memo(forwardRef(ModalForm)) as <
  Values extends Record<string, unknown> = Record<string, any>,
>(
  props: ModalFormProps<Values> & {
    ref?: React.Ref<ModalFormRefType<Values>>;
  },
) => React.ReactElement;
