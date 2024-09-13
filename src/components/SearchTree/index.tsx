import { GroupItem } from '@/helper/services/database.srv';
import { Empty, Input, Tooltip } from 'antd';
import classNames from 'classnames';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import IconFont from '../IconFont';
import GenerateContent from './GenerateContent';
import styles from './index.less';

const { Search } = Input;

export interface TreeDataNode extends GroupItem {
  childs?: TreeDataNode[];
  id: string | number;
  name: string;
  tooltip?: string;
  // 深度
  deep?: number;
  // 是否是叶子
  isLeaf?: boolean;
}

export interface SearchTreeProps {
  // 目录模式
  mode?: 'directory';
  // 顶部扩展
  topBarRender?: React.ReactNode;
  // 展示搜索框
  showSearch?: boolean;
  // 树数据
  treeData?: TreeDataNode[];
  // 异步加载 - 未实现
  loadData?: (item: TreeDataNode) => Promise<void>;
  // 选择某一项时
  onSelect?: (id?, item?: TreeDataNode) => void;
  // 每一项扩展
  extraRender?: (item: TreeDataNode) => React.ReactNode[];
}

const SearchTree: React.FC<SearchTreeProps> = (props) => {
  const {
    mode,
    topBarRender,
    showSearch = true,
    treeData = [],
    loadData,
    onSelect,
    extraRender,
  } = props;
  // 平铺后的树形结构
  const [dataList, setDatalist] = useState<TreeDataNode[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');

  //平铺树
  const flattenTreeData = (
    data: TreeDataNode[],
    List: TreeDataNode[] = [],
    deep: number = 0,
  ) => {
    if (data.length === 0) {
      return List;
    }
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      List.push({
        ...node,
        deep,
      });
      if (node.childs) {
        flattenTreeData(node.childs, List, deep + 1);
      }
    }

    return List;
  };

  useEffect(() => {
    let dataArray: TreeDataNode[] = [];
    flattenTreeData(treeData, dataArray);
    setDatalist(dataArray);
  }, [treeData]);

  const getParentKey = (id, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.childs) {
        if (node.childs.some((item) => item.id === id)) {
          parentKey = node.id;
        } else if (getParentKey(id, node.childs)) {
          parentKey = getParentKey(id, node.childs);
        }
      }
    }
    return parentKey;
  };

  // 确认搜索
  const onSearch = (value: string) => {
    if (!value) {
      setSearchValue(value);
      setExpandedKeys([]);
      return false;
    }
    const expandedKeys = dataList
      .map((item) => {
        if (item.name.indexOf(value) > -1) {
          return getParentKey(item.id, treeData);
        }
        return null;
      })
      .filter((item) => !!item);

    setSearchValue(value);
    setExpandedKeys(expandedKeys);
  };

  // 查找子节点key
  const searchHasOpenChildKey = (data: TreeDataNode[], expandedKeys: any[]) => {
    if (expandedKeys.length === 0) {
      return expandedKeys;
    }

    for (let i = 0; i < data.length; i++) {
      if (expandedKeys.length === 0) {
        break;
      }
      if (expandedKeys.includes(data[i].id)) {
        expandedKeys.splice(
          expandedKeys.findIndex((every) => every === data[i].id),
          1,
        );
      }
      if (data[i].childs && data[i].childs?.length) {
        // @ts-ignore
        searchHasOpenChildKey(data[i].childs, expandedKeys);
      }
    }

    return expandedKeys;
  };

  // 点击树控制展开
  const handleOpen = (item: TreeDataNode) => {
    // 点击分组展开
    let newExpandedKeys = cloneDeep(expandedKeys);
    if (expandedKeys.includes(item.id)) {
      // 移除当前节点key
      newExpandedKeys.splice(
        newExpandedKeys.findIndex((every) => every === item.id),
        1,
      );
      // 查找子节点是否被打开
      if (item.childs && item.childs.length) {
        searchHasOpenChildKey(item.childs, newExpandedKeys);
      }
    } else {
      newExpandedKeys.push(item.id);
    }

    setExpandedKeys(newExpandedKeys);

    if (loadData) {
      loadData(item);
    }
  };

  // 点击具体某一个节点
  const clickNode = (e, item) => {
    e.stopPropagation();
    setSelectedKey(item.id);
    onSelect?.(item.id, item);
  };

  // 生成每一项缩进量
  const generateIndentEle = (deep: number) => {
    if (deep === 0) {
      return null;
    }
    let eleArray: any[] = [];
    for (let i = 0; i < deep; i++) {
      eleArray.push(<span className="tree-node-ident" key={i}></span>);
    }
    return eleArray;
  };

  return (
    <div className={styles['search-tree-container']}>
      {!!topBarRender && (
        <div className="top-bar-render-box">{topBarRender}</div>
      )}
      <div className="tree-box">
        {showSearch && (
          <Search
            style={{ marginBottom: 16 }}
            placeholder="搜索"
            onSearch={onSearch}
          />
        )}
        <div className="tree-container">
          {dataList.length !== 0 ? (
            dataList.map((item) => {
              let parentKey = getParentKey(item.id, treeData);
              if (!!parentKey && !expandedKeys.includes(parentKey)) {
                return null;
              }
              return (
                <div
                  className={classNames('tree-node', {
                    'tree-node-parent':
                      (!!loadData && !item.isLeaf) ||
                      item.type === 1 ||
                      item.childs,
                    'tree-node-open': expandedKeys.includes(item.id),
                  })}
                  onClick={() => handleOpen(item)}
                  key={item.id}
                >
                  {generateIndentEle(item.deep ? item.deep : 0)}
                  {
                    // 异步加载节点时、数据集分组展示时、存在子节点时
                    (!!loadData && !item.isLeaf) ||
                    item.type === 1 ||
                    item.childs ? (
                      <span className="tree-node-switcher">
                        <IconFont type="ArrowRight" size={16} />
                      </span>
                    ) : mode ? (
                      <span className="tree-node-icon">
                        <IconFont type="Folder" size={16} />
                      </span>
                    ) : (
                      <span className="tree-node-icon-noop"></span>
                    )
                  }
                  <span
                    className={classNames('tree-node-content-wrapper', {
                      'tree-node-content-wrapper-selected':
                        item.id === selectedKey,
                    })}
                    onClick={(e) => clickNode(e, item)}
                  >
                    {item.tooltip ? (
                      <Tooltip title={item.tooltip} placement="right">
                        <span>
                          <GenerateContent
                            searchValue={searchValue}
                            treeItem={item}
                          />
                        </span>
                      </Tooltip>
                    ) : (
                      <GenerateContent
                        searchValue={searchValue}
                        treeItem={item}
                      />
                    )}
                  </span>
                  {!!extraRender ? (
                    <div className="tree-node-extra">{extraRender(item)}</div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <Empty />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchTree;
