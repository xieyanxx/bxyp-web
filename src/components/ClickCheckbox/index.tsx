import classNames from 'classnames';
import { cloneDeep } from 'lodash';
import React, { useState } from 'react';
import styles from './index.less';

export interface OptionType {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

interface ClickCheckboxProps {
  values: string[];
  options: OptionType[];
  onSelect?: (value: string, item: OptionType) => void;
  onChange?: (values: string[], options: OptionType[]) => void;
}

const ClickCheckbox: React.FC<ClickCheckboxProps> = (props) => {
  const { values, options, onSelect, onChange } = props;
  const [target, setTarget] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

  // 点击某一项
  const handleClick = (value: string, item: OptionType) => {
    setTarget(value);
    onSelect?.(value, item);
  };

  // check某一项
  const handleCheck = (value: string, item: OptionType) => {
    let newValues: string[] = cloneDeep(values);
    let newOptions: OptionType[] = cloneDeep(selectedOptions);

    if (newValues.includes(value)) {
      newValues.splice(
        newValues.findIndex((item) => item === value),
        1,
      );
      newOptions.splice(
        newOptions.findIndex((item) => item.value === value),
        1,
      );
    } else {
      newValues.push(value);
      newOptions.push(item);
    }

    setSelectedOptions(newOptions);
    onChange?.(newValues, newOptions);
  };

  return (
    <div className={styles['click-checkbox-container']}>
      {options.map((item) => (
        <div
          className={classNames('click-checkbox-item', {
            'click-checkbox-item-active': target === item.value,
          })}
          onClick={() => handleClick(item.value, item)}
          key={item.value}
        >
          <span
            className={classNames('click-checkbox', {
              'click-checkbox-checked': values.includes(item.value),
            })}
            onClick={(e) => {
              e.stopPropagation();
              handleCheck(item.value, item);
            }}
          >
            <span className="click-checkbox-inner"></span>
          </span>
          <span className="click-checkbox-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ClickCheckbox;
