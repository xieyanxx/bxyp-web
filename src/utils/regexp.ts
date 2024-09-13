import type { Rule } from 'rc-field-form/lib/interface';

/**
 * @name 控制台密码规则
 */
function adminPwd(): Rule[] {
  return [
    {
      pattern: /^[a-z\d]{6,18}$/gi,
      message: '6-18位字母大小写和数字',
      required: true,
    },
  ];
}

function repeatAdminPwd(name: string): Rule[] {
  return [
    { required: true, message: '重复密码必填' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue(name) === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('重复密码与密码不一致'));
      },
    }),
  ];
}

/**
 * @name 控制台菜单href字段规则
 */
function menuHref(): Rule[] {
  return [
    { pattern: /^[^\S\.]{1,20}$/gi, message: '1-20位非空字符（“.”除外）' },
  ];
}

/**
 * @name 控制台用户名规则
 */
function adminName(): Rule[] {
  return [
    { pattern: /^\S{1,20}$/i, message: '1-20位非空字符', required: true },
  ];
}

/**
 * @name 多行字符首尾不能有空白符
 */
function noSpaceBE_M(required: boolean = false) {
  return {
    pattern: /^\S((.|\n)*\S)?$/g,
    message: '不能以空白字符开头和结尾，至少一个字符',
    required,
  };
}

/**
 * @name 单行不能有空白符
 */
function noSpaceBE(required: boolean = false) {
  return {
    pattern: /^\S(.*\S)?$/g,
    message: '不能以空白字符开头和结尾，至少一个字符',
    required,
  };
}

/**
 * @name 版本号校验
 */
function version(required: boolean = false) {
  return {
    pattern: /^\d+\.\d+\.\d+$/g,
    message: '版本号必须是xx.xx.xx规则的字符串',
    required,
  };
}
/**
 * @name 单个或多个userID，以逗号隔开，单行
 */
function userIds(required: boolean = false) {
  return {
    pattern: /^\d+(,\d+)*$/g,
    message: '纯数字，多个英文逗号隔开',
    required,
  };
}

/**
 * @name http链接
 */
function href(required: boolean = false) {
  return {
    pattern: /^https?:\/\//g,
    message: '链接请以“http://”或“https://”开头',
    required,
  };
}

export {
  adminName,
  adminPwd,
  href,
  menuHref,
  noSpaceBE,
  noSpaceBE_M,
  repeatAdminPwd,
  userIds,
  version,
};
