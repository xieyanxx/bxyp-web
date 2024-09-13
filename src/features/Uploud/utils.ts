import { byte2string } from '@/utils';
import { message } from 'antd';
import type { RcFile } from 'antd/lib/upload';

type UploadFileValueType = { url?: string; id?: string };
type UploadFileValuesType = UploadFileValueType[];

/**
 * @name 多文件上传校验函数
 */
function checkFilesList(
  files: RcFile[],
  fns: ((file: RcFile[]) => Promise<boolean>)[],
) {
  return Promise.series(fns.map((fn) => () => fn(files)))
    .then((res) => res.every((v) => v === true))
    .catch((error) => (message.error(error?.message), false));
}

/**
 * @name 单个图片上传校验函数
 */
function checkImageList(
  file: RcFile,
  img: HTMLImageElement,
  fns: ((file: RcFile, img: HTMLImageElement) => Promise<boolean>)[],
) {
  return Promise.series(fns.map((fn) => () => fn(file, img)))
    .then((res) => res.every((v) => v === true))
    .catch((error) => (message.error(error?.message), false));
}

/**
 * @name 多个图片上传校验函数
 */
function checkImagesList(
  files: RcFile[],
  imgs: HTMLImageElement[],
  fns: ((file: RcFile[], img: HTMLImageElement[]) => Promise<boolean>)[],
) {
  return Promise.series(fns.map((fn) => () => fn(files, imgs)))
    .then((res) => res.every((v) => v === true))
    .catch((error) => (message.error(error?.message), false));
}

/**
 * 默认文件校验函数
 */
const DefCheckFns = [
  async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('文件尺寸超过5M');
      return false;
    }
    return true;
  },
];
/**
 * @description: 是否比给定的文件尺寸小
 * @param {number} size byte
 * @return {*}
 */
export const isLetterThanFileSize = (size: number) => async (file: RcFile) => {
  if (file.size > size) {
    message.error(
      `文件大小${byte2string(file.size)}比要求${byte2string(size)}大`,
    );
    return false;
  }
  return true;
};

/**
 * @description: 是否比给定宽高小，宽高至少给一个
 */
export const isLetterThanShapeSize =
  (data: { width?: number; height?: number }) =>
  async (file: RcFile, img: HTMLImageElement) => {
    const { width, height } = data as any;
    if (img.width < width) {
      message.error(`图片宽度(${img.width}px)比要求(${width}px)小`);
      return false;
    }
    if (img.height < height) {
      message.error(`图片高度(${img.height}px)比要求(${height}px)小`);
      return false;
    }
    return true;
  };

/**
 * @description: 是否比给定宽高大，宽高至少给一个
 */
export const isMoreThanShapeSize =
  (data: { width?: number; height?: number }) =>
  async (file: RcFile, img: HTMLImageElement) => {
    const { width, height } = data as any;
    if (img.width > width) {
      message.error(`图片宽度(${img.width}px)比要求(${width}px)大`);
      return false;
    }
    if (img.height > height) {
      message.error(`图片高度(${img.height}px)比要求(${height}px)大`);
      return false;
    }
    return true;
  };

/**
 * @description: 和指定宽度一样
 */
export const isEqualWidth =
  (width: number) => async (file: RcFile, img: HTMLImageElement) => {
    if (width !== img.width) {
      message.error(`图片宽度${img.width}px不合要求(${width}px)`);
    }
    return true;
  };

/**
 * @description: 和指定高度一样
 */
export const isEqualHeight =
  (height: number) => async (file: RcFile, img: HTMLImageElement) => {
    if (height !== img.height) {
      message.error(`图片高度${img.width}px不合要求(${height}px)`);
    }
    return true;
  };

/**
 * @description: 是否符合给定宽高比，允许一定误差
 */
export const isFitRatio =
  (data: { width: number; height: number }) =>
  (file: RcFile, img: HTMLImageElement) =>
    Math.round(img.width / img.height - data.width / data.height) <= 0.001;

/**
 * @description: 必填时校验上传组件value
 */
export function validateUpImgValue(type: 'id' | 'url', message: string) {
  return function (_: any, value: any) {
    if (!value?.[type]) return Promise.reject(message);
    return Promise.resolve();
  };
}

export { DefCheckFns, checkFilesList, checkImageList, checkImagesList };
export type { UploadFileValueType, UploadFileValuesType };
