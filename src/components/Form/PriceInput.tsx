import { Input, Select } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

type Currency = '元' | '万';
interface PriceValue {
  number?: number;
  currency?: Currency;
}

interface PriceInputProps {
  value?: PriceValue;
  onChange?: (value: PriceValue) => void;
}
export const PriceInput: React.FC<PriceInputProps> = ({
  value = {},
  onChange,
}) => {
  const [number, setNumber] = useState(0);
  const [currency, setCurrency] = useState<Currency>('元');

  const triggerChange = (changedValue: {
    number?: number;
    currency?: Currency;
  }) => {
    onChange?.({ number, currency, ...value, ...changedValue });
  };

  const onNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseInt(e.target.value || '0', 10);
    if (Number.isNaN(number)) {
      return;
    }
    if (!('number' in value)) {
      setNumber(newNumber);
    }
    triggerChange({ number: newNumber });
  };

  const onCurrencyChange = (newCurrency: Currency) => {
    if (!('currency' in value)) {
      setCurrency(newCurrency);
    }
    triggerChange({ currency: newCurrency });
  };

  return (
    <span>
      <Input
        type="text"
        value={value.number || number}
        onChange={onNumberChange}
        style={{ width: 100 }}
      />
      <Select
        value={value.currency || currency}
        style={{ width: 80, margin: '0 8px' }}
        onChange={onCurrencyChange}
      >
        <Option value="元">元</Option>
        <Option value="万">万</Option>
      </Select>
    </span>
  );
};
