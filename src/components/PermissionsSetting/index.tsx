import permissionSrv, {
  AccessRole,
  AccessUser,
  IdentityType,
  PermissionType,
} from '@/helper/services/permission.srv';
import roleSrv, { RoleItem } from '@/helper/services/role.srv';
import userSrv, { UserItem } from '@/helper/services/user.srv';
import { CloseOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Input,
  Popover,
  PopoverProps,
  Select,
  Spin,
} from 'antd';
import React, { useEffect, useState } from 'react';
import IconFont from '../IconFont';
import styles from './index.less';

const { Search } = Input;

const AccessOptions = [
  // { label: '所有权', value: 'OWNER' },
  { label: '编辑', value: 'EDIT' },
  { label: '查看（使用）', value: 'QUERY' },
  { label: '移除权限', value: 'NONE' },
];

interface PermissionsSettingContentProps {
  sourceId: number;
  dataPath: 'datasource' | 'dataset' | 'panel' | 'chart';
}

// 卡片内容组件
const PermissionsSettingContent: React.FC<PermissionsSettingContentProps> =
  React.memo((props) => {
    const { sourceId, dataPath } = props;
    const [loading, setLoading] = useState<boolean>(false);
    const [showType, setShowType] = useState<null | IdentityType>();
    // 所有用户列表、角色列表
    const [userlist, setUserList] = useState<UserItem[]>([]);
    const [roleList, setRoleList] = useState<RoleItem[]>([]);
    // 当前资源的授权列表
    const [accessUserList, setAccessUserList] = useState<AccessUser[]>([]);
    const [accessRoleList, setAccessRoleList] = useState<AccessRole[]>([]);
    // 通过校验当前资源权限列表，结合用户、角色过滤的列表
    const [userListWithoutAccess, setUserListWithoutAccess] = useState<any[]>(
      [],
    );
    const [roleListWithoutAccess, setRoleListWithoutAccess] = useState<any[]>(
      [],
    );
    // 用户、角色搜索字段
    const [searchValue, setSearchValue] = useState<string>('');
    // 选择列表的值
    const [checkedValues, setCheckedValues] = useState<number[]>([]);

    const loadBaseData = async () => {
      const userRes = await userSrv.getUserList({ current: 1, size: 200 });
      const roleRes = await roleSrv.getRoleList();

      setUserList(userRes?.data?.records || []);
      setRoleList(roleRes?.data?.records || []);

      getAccessList(userRes?.data?.records || [], roleRes?.data?.records || []);
    };

    useEffect(() => {
      loadBaseData();
    }, []);

    const getAccessList = (
      userListParm?: UserItem[],
      roleListParm?: RoleItem[],
    ) => {
      setLoading(true);
      permissionSrv
        .getResourcePermissionList(dataPath, sourceId)
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            let accessUser: any = [],
              aceessRole: any = [];

            res.data.forEach((item) => {
              if (item.permType === 'EDIT' || item.permType === 'QUERY') {
                item.users.forEach((user) => {
                  accessUser.push({
                    ...user,
                    permType: item.permType,
                  });
                });
                item.roles.forEach((role) => {
                  aceessRole.push({
                    ...role,
                    permType: item.permType,
                  });
                });
              }
              if (item.permType === 'OWNER') {
                item.users.forEach((user) => {
                  accessUser.splice(0, 0, {
                    ...user,
                    permType: 'OWNER',
                  });
                });
              }
            });

            setAccessUserList(accessUser);
            setAccessRoleList(aceessRole);
            setUserListWithoutAccess(
              (userListParm || userlist)
                .filter(
                  (item) => !accessUser.some((user) => user.id === item.id),
                )
                .map((user) => ({
                  label: user.username,
                  value: user.id,
                })),
            );
            setRoleListWithoutAccess(
              (roleListParm || roleList)
                .filter(
                  (item) =>
                    !aceessRole.some((role) => role.roleId === item.roleId),
                )
                .map((role) => ({
                  label: role.roleName,
                  value: role.roleId,
                })),
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const setAccess = (
      identityIds: number[],
      identityType: IdentityType,
      permType: PermissionType,
    ) => {
      return permissionSrv
        .setResourcePermission(dataPath, sourceId, {
          identityIds,
          identityType,
          permType,
        })
        .then((res) => {
          if (res) {
            getAccessList();
          }
        });
    };

    const handleChangePermissions = async (
      id,
      type: IdentityType,
      value: PermissionType,
    ) => {
      setLoading(true);
      await setAccess([id], type, value);
      setLoading(false);
    };

    const showSelect = (type: IdentityType) => {
      setShowType(type);
    };

    const confirmSelect = async (identityType: IdentityType) => {
      setLoading(true);
      await setAccess(checkedValues, identityType, 'QUERY');
      setLoading(false);
      setShowType(null);
      setSearchValue('');
      setCheckedValues([]);
    };

    const closeSelect = () => {
      setShowType(null);
      setSearchValue('');
      setCheckedValues([]);
    };

    const onSearch = (value: string) => {
      setSearchValue(value);
    };

    const onChange = (values) => {
      /*
            1. 判断是否有搜索关键字
            2. 如果有，将check options的选项过滤出不包含关键字的选项
            3. 过滤出原checkValues中已存在的值，与现有values合并
            4. 如果没有关键字，则保存回调中的values
        */
      let newValues = searchValue
        ? checkedValues
            .filter((value) =>
              (showType === 'user'
                ? userListWithoutAccess
                : roleListWithoutAccess
              )
                .filter((item) => item.label.indexOf(searchValue) === -1)
                .some((item) => item.value === value),
            )
            .concat(values)
        : values;
      setCheckedValues(newValues);
    };

    return (
      <Spin spinning={loading}>
        <div className="permissions-content">
          <div
            className="permissions-setting-box"
            style={!!showType ? { display: 'none' } : undefined}
          >
            <div className="header-box">
              <div
                className="add-btn add-user"
                onClick={() => showSelect('user')}
              >
                <IconFont type="AddUser" />
                <span className="add-btn-text">添加用户</span>
              </div>
              <div
                className="add-btn add-role"
                onClick={() => showSelect('role')}
              >
                <IconFont type="AddRole" />
                <span className="add-btn-text">添加角色</span>
              </div>
            </div>
            <div className="authorization-list-box">
              <div className="authorization-list-title">拥有权限用户/角色</div>
              <div className="authorization-list">
                {accessUserList.map((user) => (
                  <div className="authorization-item" key={`user_${user.id}`}>
                    <div className="authorization-info">
                      <IconFont type="User" />
                      <span className="authorization-info-name">
                        {user.username}
                      </span>
                    </div>
                    {user.permType === 'OWNER' ? (
                      <span className="authorization-owner">所有者</span>
                    ) : (
                      <Select
                        value={user.permType}
                        options={AccessOptions}
                        bordered={false}
                        onChange={(value) =>
                          handleChangePermissions(user.id, 'user', value)
                        }
                      />
                    )}
                  </div>
                ))}
                {accessRoleList.map((role) => (
                  <div
                    className="authorization-item"
                    key={`user_${role.roleId}`}
                  >
                    <div className="authorization-info">
                      <IconFont type="UserGroup" />
                      <span className="authorization-info-name">
                        {role.roleName}
                      </span>
                    </div>
                    <Select
                      value={role.permType}
                      options={AccessOptions}
                      bordered={false}
                      onChange={(value) =>
                        handleChangePermissions(role.roleId, 'role', value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="select-user-list"
            style={showType === 'user' ? undefined : { display: 'none' }}
          >
            <div className="select-header">
              <div className="select-header-content">
                <span>选择授予权限的人</span>
                <Button type="primary" onClick={() => confirmSelect('user')}>
                  确认（{checkedValues.length}人）
                </Button>
              </div>
              <div className="close-btn" onClick={closeSelect}>
                <CloseOutlined />
              </div>
            </div>
            <Search placeholder="搜索" onSearch={onSearch} />
            <div className="list-box">
              <Checkbox.Group
                value={checkedValues}
                options={
                  searchValue
                    ? userListWithoutAccess.filter(
                        (option) => option.label.indexOf(searchValue) > -1,
                      )
                    : userListWithoutAccess
                }
                onChange={onChange}
              />
            </div>
          </div>

          <div
            className="select-user-list"
            style={showType === 'role' ? undefined : { display: 'none' }}
          >
            <div className="select-header">
              <div className="select-header-content">
                <span>选择授予权限的角色</span>
                <Button type="primary" onClick={() => confirmSelect('role')}>
                  确认（{checkedValues.length}人）
                </Button>
              </div>
              <div className="close-btn" onClick={closeSelect}>
                <CloseOutlined />
              </div>
            </div>
            <Search placeholder="搜索" onSearch={onSearch} />
            <div className="list-box">
              <Checkbox.Group
                value={checkedValues}
                options={
                  searchValue
                    ? roleListWithoutAccess.filter(
                        (option) => option.label.indexOf(searchValue) > -1,
                      )
                    : roleListWithoutAccess
                }
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      </Spin>
    );
  });

interface PermissionsSettingProps extends PopoverProps {
  contentProps: PermissionsSettingContentProps;
}

// 授权卡片组件
const PermissionsSetting: React.FC<PermissionsSettingProps> = React.memo(
  (props) => {
    const { contentProps, children, ...otherPopoverProps } = props;

    return (
      <Popover
        destroyTooltipOnHide
        placement="bottomLeft"
        trigger="click"
        overlayClassName={styles['permissions-box']}
        content={<PermissionsSettingContent {...contentProps} />}
        {...otherPopoverProps}
      >
        {children}
      </Popover>
    );
  },
);

export default PermissionsSetting;
