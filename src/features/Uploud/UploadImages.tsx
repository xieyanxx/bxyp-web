/**
 * 上传多个图片组件，封装了接口。value支持sourceid和url，都支持预览
 */
import { request } from '@/helper/services/request';
import { useGetProp } from '@/hooks';
import { getFileNameByUrl, uuid } from '@/utils';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetState } from 'ahooks';
import { Image, Upload, message } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/lib/upload';
import classNames from 'classnames';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UploadAccept } from './const';
import styles from './image.less';
import { DefCheckFns } from './utils';

export type UploadImagesProps<T = any> = {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  size?: PickShapeSize<'custom' | 'l' | 'm' | 's'>;
  value?: UploadImagesValuesType;
  disabled?: boolean;
  accept?: UploadAccept[];
  maxSize?: number;
  /**
   * @description: 检查文件是否符合要求，按顺序依次执行，失败立即退出
   */
  checkFns?: ((
    files: RcFile[],
    imgs: HTMLImageElement[],
  ) => Promise<boolean>)[];
  /**
   * @description 点击文件列表的删除是否清除文件列表
   * @default false
   */
  clearOnRemove?: boolean;
  onChange?: (data: UploadImagesValuesType) => void;
  beforeUpload?: (file: RcFile, FileList: RcFile[]) => Promise<boolean>;
  customRequest?: (
    options: UploadRequestOption<T>,
  ) => Promise<{ url?: string; id?: string } | void>;
} & Pick<UploadProps, 'maxCount' | 'listType'>;
export type UploadImagesValuesType = { url?: string; id?: string }[];
const { Dragger } = Upload;
export type UploadImagesRefType = { reset: () => void };

function UploadImages<T = any>(
  {
    size = 's',
    maxCount = 1,
    listType = 'picture-card',
    clearOnRemove,
    value,
    accept = [UploadAccept.img],
    disabled,
    checkFns = DefCheckFns,
    className,
    wrapperStyle,
    onChange,
    beforeUpload,
    customRequest,
    maxSize = 5,
    ...restProps
  }: UploadImagesProps<T>,
  ref: React.Ref<UploadImagesRefType>,
) {
  const fetchRef = useRef(0);
  const taskRef = useRef<{
    length: number;
    res: (string | { url?: string; id?: string })[];
  }>({ length: 0, res: [] });
  const getOnChange = useGetProp(onChange);
  const getBeforeUpload = useGetProp(beforeUpload);
  const getCheckFns = useGetProp(checkFns);
  const getCustomRequest = useGetProp(customRequest);
  const getVlearOnRemove = useGetProp(clearOnRemove);
  const [values, setValues, getValues] = useGetState<UploadImagesValuesType>(
    [],
  );
  // const [fileList, setFileList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setLoading(false);
        setValues([]);
        getOnChange()?.([]);
      },
    }),
    [],
  );
  useEffect(() => {
    setValues(value || []);
  }, [value]);
  const fileList = useMemo(() => {
    if (values.length) {
      return values.map((v) => ({
        thumbUrl: v.url,
        tatus: 'done',
        name: getFileNameByUrl(v.url),
        uid: uuid(),
      }));
    } else {
      return [];
    }
  }, [values, value]);
  /**
   * @description 从values中找出只有id的请求url
   */
  const beforeUploadfn = useCallback(async (file: RcFile, list: RcFile[]) => {
    const isJPG =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif';
    if (file.size > maxSize * 1024 * 1024) {
      message.warning(`大小不超过${maxSize}M`);
      return false;
    }
    if (isJPG) {
      return true;
    } else {
      message.warning('请上传正确的图片格式！');
      return false;
    }
  }, []);
  const customRequestfn = useCallback(
    async (options: UploadRequestOption) => {
      const file = options.file as RcFile;
      request.upload({ bizType: 'COMMON', file }).then(({ success, data }) => {
        setLoading(false);
        if (success) {
          const res = { url: data.url, id: data.id };
          setValues([...values, res]);
          getOnChange()?.([...values, res]);
          options.onSuccess?.([]);
        } else {
          message.error(`上传失败：${(data as any)?.message}`);
          options.onError?.(new Error('上传失败'));
        }
      });
    },

    [loading, fileList],
  );
  const onRemove = useCallback(
    (file: UploadFile<any>) => {
      console.log(file, 'file');
      const index = fileList.findIndex(
        (v: any) => v.thumbUrl === file.thumbUrl,
      );
      if (index > -1) {
        const files = getValues().filter((_, i) => i !== index);
        getOnChange()?.(files);
        setValues(files);
      }
    },
    [fileList],
  );
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  const handlePreview = async (file: UploadFile) => {
    console.log(file);
  };
  return (
    <div
      className={classNames(styles.upload, className, styles[`upload-${size}`])}
      style={wrapperStyle}
    >
      {fileList.length ? (
        <div className={styles.img_list}>
          {fileList.map((item: any) => (
            <div
              key={item.uid}
              className={classNames(styles.list_wrap, styles[`wrap-${size}`])}
            >
              <Image
                src={item.thumbUrl}
                width={'100%'}
                height={'100%'}
                style={{ objectFit: 'contain' }}
              />
              <DeleteOutlined onClick={() => onRemove(item)} />
            </div>
          ))}
        </div>
      ) : (
        ''
      )}
      <Upload
        listType={listType}
        beforeUpload={beforeUploadfn}
        // 不传会默认调用本地接口
        customRequest={customRequestfn}
        showUploadList={false}
        // multiple
        fileList={fileList}
        disabled={loading || disabled}
        accept={accept?.join?.(', ')}
        onRemove={onRemove}
        onPreview={handlePreview}
        {...restProps}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
    </div>
  );
}

export default memo(forwardRef(UploadImages)) as <T = any>(
  props: UploadImagesProps<T> & { ref?: React.Ref<UploadImagesRefType> },
) => React.ReactElement;
