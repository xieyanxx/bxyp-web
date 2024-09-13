import { NestedFormRef, NestedModalForm } from '@/components/Form';
import { UploadImage, UploadImageValuesType } from '@/features/Uploud';
import productManage, { ColumnProduct } from '@/helper/services/productManage';
import { UnitOptions } from '@/helper/services/utils';
import {
  ProFormDigit,
  ProFormItem,
  ProFormMoney,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { ProFormText } from '@ant-design/pro-form';
import { memo, useCallback, useRef } from 'react';

type Values = {
  basic: {
    name: string;
    online: boolean;
    pic: UploadImageValuesType;
    sell_price: number;
    buy_price: number;
    unit: string;
    stock: number;
    category_id: number;
  };
};
function Add({ raw, reload }: { raw?: ColumnProduct; reload: () => void }) {
  const modal = useRef<NestedFormRef>(null);
  const getValues = useCallback(() => {
    if (raw) {
      const { pic } = raw;
      const data: any = {
        ...raw,
        pic: { url: pic },
      };
      return data;
    }
  }, [raw]);
  const submit = useCallback(
    async (values: Values) => {
      const { sell_price, buy_price, pic } = values.basic;
      const data: any = {
        ...values.basic,
        sell_price: sell_price * 100,
        buy_price: buy_price * 100,
        pic: pic.url,
        id: raw?.id,
      };
      return productManage.updateProduct(data).then((res) => {
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
      <ProFormText
        name="name"
        label="商品名称"
        fieldProps={{ maxLength: 30 }}
        rules={[{ required: true }]}
      />
      <ProFormMoney
        label="商品进价"
        name="buy_price"
        width={'lg'}
        min={0.01}
        max={99999999}
        fieldProps={{ precision: 2, moneySymbol: false }}
        rules={[{ required: true }]}
      />
      <ProFormMoney
        label="商品售价"
        name="sell_price"
        width={'lg'}
        min={0.01}
        max={99999999}
        fieldProps={{ precision: 2, moneySymbol: false }}
        rules={[{ required: true }]}
        addonAfter={
          <ProFormSelect
            name="unit"
            label=""
            noStyle
            options={UnitOptions}
            placeholder="请选择"
            rules={[{ required: true }]}
            width={'xs'}
          />
        }
      />
      <ProFormSelect
        name="category_id"
        label="所属类别"
        options={[]}
        placeholder="选择认养农产品"
        rules={[{ required: true }]}
        width={'lg'}
        showSearch
        fieldProps={{
          // onChange: handleSelectArea,
          fieldNames: { label: 'name', value: 'id' },
        }}
        debounceTime={300}
      />
      <ProFormDigit
        name="stock"
        width={'lg'}
        label="总库存"
        rules={[{ required: true }]}
        max={99999999}
      />
      <ProFormItem name="pic" label="商品图" rules={[{ required: true }]}>
        <UploadImage />
      </ProFormItem>
      <ProFormRadio.Group
        name="online"
        label="是否上架"
        options={[
          {
            value: true,
            label: '是',
          },
          {
            value: false,
            label: '否',
          },
        ]}
        rules={[{ required: true }]}
      />
    </NestedModalForm>
  );
}

export default memo(Add);
