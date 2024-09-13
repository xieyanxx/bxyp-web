import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { SketchPicker, SketchPickerProps } from 'react-color';
import styles from './index.less';

interface ColorPickerProps extends SketchPickerProps {
  defaultColor?: string;
  direction?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = React.memo((props) => {
  const { defaultColor, direction, ...sketchPickerProps } = props;
  const [value, setValue] = useState('');
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  useEffect(() => {
    if (defaultColor) {
      setValue(defaultColor);
    }
  }, [defaultColor]);

  const handleClose = (color) => {
    setDisplayColorPicker(false);
  };

  const handleShow = () => {
    setDisplayColorPicker(true);
  };

  const handleChange = (color) => {
    setValue(color.hex);
    return color.hex;
  };

  return (
    <div className={styles['color-picker']}>
      <div className={styles['val-container']}>
        <Input
          readOnly
          onClick={handleShow}
          value={typeof value === 'string' ? value : ''}
        />
        <div
          style={{ background: typeof value === 'string' ? value : 'unset' }}
          className={styles.block}
        />
      </div>
      {displayColorPicker ? (
        <div>
          <div className={styles.cover} onClick={handleClose} />
          <div style={{ position: 'relative' }}>
            <div className={`${styles.popover} ${direction ? direction : ''}`}>
              <SketchPicker
                onChange={handleChange}
                disableAlpha={true}
                presetColors={[]}
                color={value}
                {...sketchPickerProps}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default ColorPicker;
