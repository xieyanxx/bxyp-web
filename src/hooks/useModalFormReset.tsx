import { Form } from 'antd';
import { useCallback } from 'react';

function useModalFormReset<Values = any>(
  initialValues?: Partial<Values> | void,
  callback?: (visible: boolean) => void,
) {
  const [form] = Form.useForm<Values>();
  const onVisibleChange = useCallback(
    (visible: boolean) => {
      if (visible) {
        form.resetFields();
        form.setFieldsValue(initialValues as any);
      }
      callback?.(visible);
    },
    [initialValues, callback],
  );
  return { form, onVisibleChange };
}

export { useModalFormReset };
