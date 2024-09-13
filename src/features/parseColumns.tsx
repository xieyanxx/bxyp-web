import type { ProColumns } from '@ant-design/pro-components';
import { Space, SpaceProps } from 'antd';
import { isFunction } from 'lodash';

type WithFalseType<T = any> = T | false;
export type ParseColumnsConfig<T> = {
  search?: false;
  columns: ProColumns<T>[] | any;
  index?: WithFalseType<ProColumns<T>> | any;
  operationRecord?: WithFalseType<
    Omit<ProColumns<T>, 'valueType' | 'render'> & {
      format?: (data: T) => {
        operationTime?: string;
        operation?: string;
      };
    }
  >;
  operation?: WithFalseType<
    Omit<ProColumns<T>, 'valueType'> & {
      spaceProps?: SpaceProps;
    }
  >;
};

/**
 * @description: 简化创建columns流程，大多数情况下列表都是序号...操作、操作记录
 * @default: 默认序号是index风格
 * @default: 默认每项都hideInSearch
 * @default: 操作项一般都是按钮，默认集成Space direction="vertical"
 */
function parseColumns<T extends Record<string, any> = Record<string, any>>(
  config: ParseColumnsConfig<T>,
) {
  const {
    index,
    operation = {},
    operationRecord = {},
    columns = [],
    search,
  } = config;
  const items = columns.map((item) => {
    if (search !== false) {
      if (item.hideInSearch === undefined) {
        item.hideInSearch = true;
      }
    }
    return item;
  });
  if (index === undefined) {
    items.unshift({
      title: '序号',
      valueType: 'index',
      width: '80px',
      ...index,
    });
  }
  if (operation) {
    const { title = '操作', spaceProps, render, ...rest } = operation;
    items.push({
      title,
      valueType: 'option',
      render: isFunction(render)
        ? (...args) => (
            <Space direction="vertical" {...spaceProps}>
              {/* @ts-ignore */}
              {render.apply(undefined, args)}
            </Space>
          )
        : render,
      ...rest,
    });
  }
  // if (operationRecord) {
  //     const {
  //         title = '操作记录',
  //         format = ({ operator, operationTime }) => ({
  //             operator,
  //             operationTime,
  //         }),
  //         ...rest
  //     } = operationRecord;
  //     items.push({
  //         title,
  //         valueType: 'option',
  //         render: (_, data) => (
  //             <OperationRecord format={() => format(data)} />
  //         ),
  //         ...rest,
  //     });
  // }
  return items;
}

export { parseColumns };
