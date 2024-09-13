import { DatabaseEnum, DatabaseItem } from '@/helper/services/database.srv';
import { Divider, Empty, Input } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { Search } = Input;

interface DataEnumItemType {
  text: string;
  textColor: string;
}

interface DataEnumType {
  1: DataEnumItemType;
  2: DataEnumItemType;
  3: DataEnumItemType;
}

export interface SearchListProps {
  // 顶部扩展
  topBarRender?: React.ReactNode;
  showSearch?: boolean;
  listData?: DatabaseItem[];
  onSelect?: (id, item: DatabaseItem) => void;
  // 每一行扩展
  showDeteleButton?: boolean;
  listExtraRender?: (item: DatabaseItem) => React.ReactNode;
  // 枚举值
  dataEnum?: DataEnumType;
}

const SearchList: React.FC<SearchListProps> = (props) => {
  const {
    topBarRender,
    showSearch,
    listData = [],
    onSelect,
    dataEnum = DatabaseEnum,
    showDeteleButton,
    listExtraRender,
  } = props;
  const [searchValue, setSearchValue] = useState('');
  const [searchData, setSearchData] = useState<DatabaseItem[]>(listData);
  const [active, setActive] = useState();

  useEffect(() => {
    setSearchData(listData);
  }, [listData]);

  // 数据集和字段的共同 onSearch
  const onSearch = (value) => {
    if (value) {
      let newData = listData.filter((item) => item.name.indexOf(value) > -1);
      setSearchData(newData);
    } else {
      setSearchData(listData);
    }
    setSearchValue(value);
  };

  const handleClick = (id, item) => {
    setActive(id);
    onSelect?.(id, item);
  };

  const renderSearchText = (text: string) => {
    if (!searchValue) {
      return text;
    }
    const index = text.indexOf(searchValue);
    const beforeStr = text.substr(0, index);
    const afterStr = text.substr(index + searchValue.length);
    const newText =
      index > -1 ? (
        <span>
          {beforeStr}
          <span className="search-value">{searchValue}</span>
          {afterStr}
        </span>
      ) : (
        text
      );

    return newText;
  };

  return (
    <div className={styles['search-list-box']}>
      {topBarRender ? topBarRender : null}
      {!!topBarRender && <Divider />}
      {showSearch && (
        <Search
          placeholder="输入关键字查询"
          style={{ marginBottom: 16 }}
          onSearch={onSearch}
        />
      )}
      <div className="search-list">
        {searchData.length !== 0 ? (
          searchData.map((item) => (
            <div
              className={classNames('search-list-item', {
                'search-list-item-avtive': active === item.id,
              })}
              onClick={() => handleClick(item.id, item)}
              key={item.id}
            >
              <div
                className="search-list-item-icon"
                style={{ color: dataEnum[item.type].textColor }}
              >
                {dataEnum[item.type].text}
              </div>
              <div className="search-list-item-content">
                {searchValue ? renderSearchText(item.name) : item.name}
              </div>
              {showDeteleButton && item.manager && listExtraRender
                ? listExtraRender(item)
                : null}
            </div>
          ))
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

export default SearchList;
