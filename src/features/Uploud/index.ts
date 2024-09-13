/**
 * 上传多个或单个文件用UploadFile。上传单个图片就用UploadImage；上传单个音频就用UploadAudio；上传单个视频就用UploadVideo
 */
import UploadFile, {
  UploadFileValueType,
  UploadFilesValueType,
} from './UploadFile';
import UploadImage, {
  UploadImageProps,
  UploadImageRefType,
  UploadImageValuesType,
} from './UploadImage';
import UploadImages, {
  UploadImagesProps,
  UploadImagesRefType,
  UploadImagesValuesType,
} from './UploadImages';
import type { UploadAudioProps } from './UploadVideo';
import UploadAuio from './UploadVideo';
import { UploadAccept } from './const';
import {
  UploadFileValuesType,
  isEqualHeight,
  isEqualWidth,
  isFitRatio,
  isLetterThanFileSize,
  isLetterThanShapeSize,
  isMoreThanShapeSize,
  validateUpImgValue,
} from './utils';

export {
  UploadAccept,
  UploadAuio,
  UploadFile,
  UploadImage,
  UploadImages,
  isEqualHeight,
  isEqualWidth,
  isFitRatio,
  isLetterThanFileSize,
  isLetterThanShapeSize,
  isMoreThanShapeSize,
  validateUpImgValue,
};
export type {
  UploadAudioProps,
  UploadFileValueType,
  UploadFileValuesType,
  UploadFilesValueType,
  UploadImageProps,
  UploadImageRefType,
  UploadImageValuesType,
  UploadImagesProps,
  UploadImagesRefType,
  UploadImagesValuesType,
};
