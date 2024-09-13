/*
 * @Description: 文件变动后，注意检测是否都对scripts/api_menus有影响
 */

export const ApiModuleTest: [string, RegExp[]][] = [
  ['biz-service', [/^\/?console\/farm\//i]],
  ['biz-service', [/^\/?console\/cos\//i]],
  ['biz-service', [/^\/?console\/map\//i]],
  ['user-service', [/^\/?console\/user-service\//i]],
];
