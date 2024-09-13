import { Button, Input, Modal, ModalProps, message } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

type Key = 'minutes' | 'hours' | 'day' | 'month' | 'week';

const baseRules = [
  { symbol: '*', description: '任意值' },
  { symbol: ',', description: '值列表分隔符' },
  { symbol: '-', description: '值范围' },
  { symbol: '/', description: '步长' },
];

const formList: {
  key: Key;
  label: string;
  rules: any;
}[] = [
  {
    key: 'minutes',
    label: '分钟',
    rules: [...baseRules, { symbol: '0-59', description: '允许输入值范围' }],
  },
  {
    key: 'hours',
    label: '小时',
    rules: [...baseRules, { symbol: '0-23', description: '允许输入值范围' }],
  },
  {
    key: 'day',
    label: '每月第几天',
    rules: [
      ...baseRules,
      { symbol: '1-31', description: '允许输入值范围' },
      { symbol: '?', description: '空格' },
    ],
  },
  {
    key: 'month',
    label: '月份',
    rules: [...baseRules, { symbol: '1-12', description: '允许输入值范围' }],
  },
  {
    key: 'week',
    label: '周几',
    rules: [
      ...baseRules,
      { symbol: '1-7', description: '周一、周二、周三、周四、周五、周日' },
      { symbol: '?', description: '空格' },
    ],
  },
];

const defaultTimeValue = '0 * * ? * *';

interface SelectTimeModalProps extends ModalProps {
  // 回显值
  defaultCron?: string;
  onConfirm: (timeString: string) => void;
}

const SelectTimeModal: React.FC<SelectTimeModalProps> = (props) => {
  const { defaultCron, onConfirm, ...modalProps } = props;
  const [key, setKey] = useState<Key | null>(null);
  const [values, setValues] = useState<string[]>(['*', '*', '?', '*', '*']);
  const [timeValue, setTimeValue] = useState<string>(defaultTimeValue);
  const [timeList, setTimeList] = useState<string[]>([]);

  useEffect(() => {
    updateExpression(timeValue);
  }, []);

  useEffect(() => {
    if (defaultCron) {
      let defaultCronList = defaultCron.split(' ');
      // 去掉默认的0
      defaultCronList.splice(0, 1);

      setValues(defaultCronList);
      setTimeValue(defaultCron);
      updateExpression(defaultCronList.join(' '));
    }
  }, [defaultCron]);

  const RuleList = () => {
    if (!key) {
      return null;
    }

    const targetRule = formList.find((item) => item.key === key);

    return (
      <div className="config-info-box">
        {targetRule?.rules.map((item) => (
          <div className="config-info-item" key={targetRule.key + item.symbol}>
            <div className="config-info-item-symbol">{item.symbol}</div>
            <div className="config-info-item-description">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const onChange = (index: number, value) => {
    let _timeValue = '';
    const _values = [...values];
    _values[index] = value;
    _timeValue = _values.some((value) => !!value) ? _values.join(' ') : '';
    setValues(_values);
    setTimeValue('0 ' + _timeValue);
    updateExpression(_timeValue);
  };

  const modifyStrToUnixCronSyntax = (str) => {
    let res = str.split('#');
    res[0] = res[0].replace(/[0-7]/g, (match) => {
      return (parseInt(match) + 6) % 7;
    });
    return res.join('#');
  };

  const transformFromQuartzToUnixCron = (str) => {
    let res = str.split(' ');
    res[res.length - 1] = modifyStrToUnixCronSyntax(res[res.length - 1]);
    return res.join(' ');
  };

  const updateExpression = debounce((value) => {
    let unixCronStr = transformFromQuartzToUnixCron(value);
    //@ts-ignore
    let laterCron = later.parse.cron(unixCronStr);
    // 获取东八区时间
    let serverTime = moment().tz('Asia/Shanghai');
    let serverTimeInJsDateFormat = new Date();
    serverTimeInJsDateFormat.setUTCHours(
      serverTime.get('hour'),
      serverTime.get('minute'),
      0,
      0,
    );
    serverTimeInJsDateFormat.setUTCMonth(
      serverTime.get('month'),
      serverTime.get('date'),
    );

    let timeList: string[] = [];
    for (let i = 9; i >= 0; i--) {
      //@ts-ignore
      let occurrence = later
        .schedule(laterCron)
        .next(1, serverTimeInJsDateFormat);
      if (occurrence) {
        let strTime = JSON.stringify(occurrence);
        let nextTime = strTime.substring(1, strTime.length - 6);
        timeList.push(nextTime);
        serverTimeInJsDateFormat = occurrence;
        serverTimeInJsDateFormat.setSeconds(
          serverTimeInJsDateFormat.getSeconds() + 10,
        );
      } else {
        break;
      }
    }
    setTimeList(timeList);
  }, 500);

  const reset = () => {
    setValues(['*', '*', '?', '*', '*']);
    setTimeValue(defaultTimeValue);
    updateExpression('* * ? * *');
  };

  const onOK = () => {
    if (!timeValue) {
      return message.warning('未输入，无法提交');
    }
    if (values[2] !== '?' && values[4] !== '?') {
      return message.warning('每月第几天和周几，必须至少有一个是“?”');
    }
    onConfirm(timeValue);
  };

  return (
    <Modal
      {...modalProps}
      onOk={onOK}
      width={640}
      title="更新时间选择"
      className={styles['select-time-modal']}
      centered={true}
    >
      <span className="prompt-text">更新时间基于服务器时间：北京时间</span>
      <div className="form-box">
        <div className="form-wrapper">
          {formList.map((item, index) => (
            <div className="form-left-item" key={item.key}>
              <div
                className={classNames('form-left-item-label', {
                  'form-left-item-label-focus': key === item.key,
                })}
              >
                {item.label}
              </div>
              <Input
                className="form-left-item-input"
                onFocus={() => setKey(item.key)}
                onBlur={() => setKey(null)}
                value={values[index]}
                onChange={(e) => onChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="config-info">
          <div className="config-info-title">特殊字符</div>
          <RuleList />
        </div>
      </div>
      <div className="time-value-box">
        <div className="time-value">{timeValue}</div>
        <Button type="primary" onClick={reset}>
          重置
        </Button>
      </div>
      <div className="exmaple-times">
        <div className="exmaple-times-title">
          当前更新时间选择，最近的10个数据更新时间：
        </div>
        <ul className="exmaple-times-list">
          {timeList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default SelectTimeModal;
