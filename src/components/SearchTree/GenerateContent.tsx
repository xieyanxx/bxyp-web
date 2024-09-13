/* 生成数据集列表item内容 */
import React from 'react';
import { TreeDataNode } from '.';

interface GenerateContentProps {
  searchValue?: string;
  treeItem: TreeDataNode;
}

const GenerateContent: React.FC<GenerateContentProps> = (props) => {
  const { searchValue, treeItem } = props;

  if (searchValue && treeItem.name.indexOf(searchValue) > -1) {
    const index = treeItem.name.indexOf(searchValue);
    const beforeStr = treeItem.name.substr(0, index);
    const afterStr = treeItem.name.substr(index + searchValue.length);

    return (
      <span className="tree-node-content">
        {beforeStr}
        <span className="site-tree-search-value">{searchValue}</span>
        {afterStr}
      </span>
    );
  }

  return <span className="tree-node-content">{treeItem.name}</span>;
};

export default GenerateContent;
