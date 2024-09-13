import { Input, InputProps, Modal, ModalProps, message } from 'antd';
import { TextAreaProps } from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { TextArea } = Input;

interface InputModalProps extends ModalProps {
  label?: string;
  defaultValue?: string;
  inputProps?: InputProps;
  showDescInput?: boolean;
  descLabel?: string;
  defaultDescValue?: string;
  descInputProps?: TextAreaProps;
  modalOnOk: (value: string, desc?: string) => void;
}

const InputModal: React.FC<InputModalProps> = (props) => {
  const {
    label,
    defaultValue,
    inputProps,
    showDescInput,
    descLabel,
    defaultDescValue,
    descInputProps,
    modalOnOk,
    visible,
    ...modalProps
  } = props;
  const [value, setValue] = useState('');
  const [desc, setDesc] = useState<string | undefined>();

  // 关闭modal，清空
  useEffect(() => {
    if (!visible) {
      setValue('');
      setDesc('');
    }
  }, [visible]);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (defaultDescValue !== undefined) {
      setDesc(defaultDescValue);
    }
  }, [defaultDescValue]);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const onDescChange = (e) => {
    setDesc(e.target.value);
  };

  const onOk = () => {
    if (!value) {
      return message.warn(`请输入${label || '名字'}`);
    }
    modalOnOk(value, desc);
  };

  return (
    <Modal
      className={styles['input-name-modal']}
      visible={visible}
      onOk={onOk}
      {...modalProps}
    >
      <div className="value-input">
        <span className="value-input-label">{label || '名字'}：</span>
        <Input
          style={{ width: 320 }}
          {...inputProps}
          value={value}
          onChange={onChange}
        />
      </div>
      {showDescInput && (
        <div className="description-input">
          <span className="description-input-label">
            {descLabel || '描述'}：
          </span>
          <TextArea
            style={{ width: 320 }}
            autoSize={{ minRows: 4, maxRows: 6 }}
            {...descInputProps}
            value={desc}
            onChange={onDescChange}
          />
        </div>
      )}
    </Modal>
  );
};

export default InputModal;
