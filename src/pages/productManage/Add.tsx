import { NestedFormRef, NestedModalForm } from '@/components/Form';
import { UploadImage, UploadImageValuesType } from '@/features/Uploud';
import classification from '@/helper/services/classification';
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
    sellPrice: number;
    buyPrice: number;
    unit: string;
    stock: number;
    categoryId: number;
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
    return { online: false };
  }, [raw]);
  const submit = useCallback(
    async (values: Values) => {
      const { sellPrice, buyPrice, pic } = values.basic;
      const data: any = {
        ...values.basic,
        sellPrice: sellPrice * 100,
        buyPrice: buyPrice * 100,
        pic: pic.url,
        id: raw?.id,
      };
      return productManage.updateProduct(data).then((res) => {
        reload();
        return res;
      });
    },
    [raw],
  );

  //获取商品分类
  const getCategory = (params: PagingArgs<{ name?: string }>) => {
    const { pageSize: size = 20, current: page = 1, name } = params;
    const data = {
      pageNumber: page - 1,
      pageSize: size,
      name: name || '',
    };
    return classification.categoryList(data).then((res) => {
      return res.data;
    });
  };

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
        name="buyPrice"
        width={'lg'}
        min={0.01}
        max={99999999}
        fieldProps={{ precision: 2, moneySymbol: false }}
        rules={[{ required: true }]}
      />
      <ProFormMoney
        label="商品售价"
        name="sellPrice"
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
        name="categoryId"
        label="所属类别"
        placeholder="选择所属类别"
        rules={[{ required: true }]}
        width={'lg'}
        showSearch
        fieldProps={{
          fieldNames: { label: 'name', value: 'id' },
        }}
        request={async ({ name = '' }: { name?: string }) =>
          getCategory({ name })
        }
        debounceTime={1000}
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
