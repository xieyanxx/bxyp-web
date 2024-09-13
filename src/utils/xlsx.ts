/*
 * @Description: 基于xlsx封装处理excel、csv方法。
 * * xlsx非会员不能处理图片、样式，但是bug较少，性能好（3000+行10+列没问题）。
 */

import { isNumber } from 'lodash';
import type {
  AOA2SheetOpts,
  JSON2SheetOpts,
  Sheet2JSONOpts,
  WorkSheet,
  WritingOptions,
} from 'xlsx';
import { read, utils, writeFile } from 'xlsx';

/**
 * @description: 读取xlsx文件，并返回解析的数据。推荐标题在每列第一行格式。
 * @description: 以每列第一行为key，第二行开始的数据为值，组成一个对象。
 * @description: 如果某列第一行没数据，但是后列有数据，key变成__EMPTY(_${n})?。某行第一个空是__EMPTY，n随着空标题数递增。__rowNum__反映数据行数
 * @description: 某行没数据，会自动过滤
 * @param config.file 文件数据
 * @param config.sheetIndex 要处理的页码，从0开始。默认读取文件全部有内容的页面；传数组会按序号顺序返回指定页面内容数据数组；传数字会返回指定页面数据
 * @param config.options 解析参数
 * @attention 不要有合并的单元格
 * @attention 不清楚除数字和字符串之外格式数据如何格式化，所以表格不能修改单元格格式
 */
function readXLSX<T = Record<string, number | string>>(config: {
  file: Blob;
  sheetIndex?: number[] | number;
  options?: Sheet2JSONOpts;
}): Promise<T[][]> {
  return new Promise((resolve, reject) => {
    const { file, sheetIndex, options } = config;
    const reader = new FileReader();
    let rejected = false;
    reader.onerror = function () {
      rejected = true;
      reject(new Error('failed to read file as BinarySstring'));
    };
    reader.onloadend = function (e: ProgressEvent<FileReader>) {
      if (rejected) return;
      try {
        const data = e.target.result;
        const workbook = read(data, { type: 'buffer' });
        if (isNumber(sheetIndex)) {
          const json = utils.sheet_to_json<T>(
            workbook.Sheets[workbook.SheetNames[sheetIndex]],
            options,
          );
          return resolve([json]);
        }
        const args: [WorkSheet, Sheet2JSONOpts][] = Array.isArray(sheetIndex)
          ? sheetIndex.map((index) => [
              workbook.Sheets[workbook.SheetNames[index]],
              options,
            ])
          : workbook.SheetNames.map((name) => [workbook.Sheets[name], options]);
        const res: any = args.map((v) => utils.sheet_to_json<T>(...v));
        resolve(res);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * @description 根据配置下载一份excel文件。
 * @param filename要带后缀(xlsx/csv/xls/xlsb)。
 * @param sheets.data 每页数据，逐行写入。如果每行数据都完整（空位补空字符串），推荐Record<string, string | number>[]，否则推荐(string | number | undefined)[][]。
 * @param sheets.data 如果数组里有一个数组，调用XLSX.utils.aoa_to_sheet，能严格控制数据位置；否则调用XLSX.utils.json_to_sheet，以key为标题，但标题位置没规律。
 * @param sheets.options
 * @param sheets.name 页标题，默认Sheet${n}
 * @param sheets.roll
 * @param sheets.modify 创建worksheet后，可以设置行（worksheet['!rows']）、列（worksheet['!cols']）等
 */
function writeXLSX(config: {
  filename: string;
  sheets: {
    data: (
      | Record<string, string | number | undefined | null>
      | (string | number | undefined | null)[]
    )[];
    /**
     * @name 标签页配置
     */
    options?: JSON2SheetOpts | AOA2SheetOpts;
    /**
     * @name 标签页名
     */
    name?: string;
    roll?: boolean;
    /**
     * @description 可以设置列宽、行高等。比如列宽：找出数据中最长字符，设置WorkSheet['!cols']={wch:length}
     */
    modify?: (sheet: WorkSheet) => void;
  }[];
  options?: WritingOptions;
}) {
  return new Promise<void>((resolve, reject) => {
    try {
      const { filename, sheets, options = { type: 'file' } } = config;
      const workbook = utils.book_new();
      sheets.map(({ data, options, name, roll, modify }) => {
        const worksheet = data.find((v) => Array.isArray(v))
          ? utils.aoa_to_sheet(data as [], options)
          : utils.json_to_sheet(data, options);
        modify?.(worksheet);
        utils.book_append_sheet(workbook, worksheet, name, roll);
      });
      writeFile(workbook, filename, options);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export { readXLSX, writeXLSX };
