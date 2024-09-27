import { NestedFormRef, NestedModalForm } from '@/components/Form';
import { UploadImage, UploadImageValuesType } from '@/features/Uploud';
import classification, {
  ColumnCategory,
} from '@/helper/services/classification';
import { ProFormItem } from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-form';
import { memo, useCallback, useRef } from 'react';

type Values = {
  basic: {
    name: string;
    pic: UploadImageValuesType;
  };
};
function Add({ raw, reload }: { raw?: ColumnCategory; reload: () => void }) {
  const modal = useRef<NestedFormRef>(null);
  const getValues = useCallback(() => {
    if (raw) {
      const { name, pic } = raw;
      const data: any = {
        name,
        pic: { url: pic },
      };
      return data;
    }
  }, [raw]);
  const submit = useCallback(
    async (values: Values) => {
      const { name, pic } = values.basic;
      const data: any = {
        name,
        pic: pic.url,
        id: raw?.id,
      };
      return classification.updateCategory(data).then((res) => {
        reload();
        return res;
      });
    },
    [raw, reload],
  );

  return (
    <NestedModalForm<Values>
      ref={modal}
      formName="basic"
      getValues={getValues}
      onFinish={submit}
      isEdit={!!raw}
    >
      <ProFormText name="name" label="类别名" rules={[{ required: true }]} />
      <ProFormItem name="pic" label="图片" rules={[{ required: true }]}>
        <UploadImage />
      </ProFormItem>
    </NestedModalForm>
  );
}

export default memo(Add);
