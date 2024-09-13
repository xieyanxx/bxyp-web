import { utils } from 'xlsx';

/**
 * @description 把数字序号转成excel列序号
 * @param {col} number
 * @return {string}
 */
const index2XLSXIndex = utils.encode_col;

export { index2XLSXIndex };
