/**
 * 上传单个图片组件，封装了接口。value支持sourceid和url，都支持预览
 */
import { request } from '@/helper/services/request';
import { useGetProp } from '@/hooks';
import { getFileNameByUrl, loadImage, uuid } from '@/utils';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useGetState } from 'ahooks';
import { Upload, message } from 'antd';
import type { RcFile, UploadProps } from 'antd/lib/upload';
import classNames from 'classnames';
import { isFunction } from 'lodash';
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
import { DefCheckFns, checkImageList } from './utils';

export type UploadImageProps<T = any> = React.PropsWithChildren<
  {
    className?: string;
    wrapperStyle?: React.CSSProperties;
    size?: PickShapeSize<'custom' | 'l' | 'm' | 's'>;
    value?: UploadImageValuesType;
    disabled?: boolean;
    accept?: UploadAccept[];
    /**
     * @description: 检查文件是否符合要求，按顺序依次执行，失败立即退出
     */
    checkFns?: ((file: RcFile, img: HTMLImageElement) => Promise<boolean>)[];
    maxCount?: number;
    onChange?: (data: UploadImageValuesType) => void;
    beforeUpload?: (file: RcFile, FileList: RcFile[]) => Promise<boolean>;
    customRequest?: (options: UploadRequestOption<T>) => Promise<any>;
  } & Pick<UploadProps, 'progress'>
>;
export type UploadImageValuesType = { url?: string; id?: string };
const { Dragger } = Upload;
export type UploadImageRefType = { reset: () => void };

/**
 * @description: 上传图片组件，有的需要资源id有的需要资源url
 */
function UploadImage<T = any>(
  {
    size = 's',
    value,
    accept = [UploadAccept.img],
    disabled,
    children,
    checkFns = DefCheckFns,
    className,
    wrapperStyle,
    onChange,
    beforeUpload,
    customRequest,
    maxCount = 1,
    ...restProps
  }: UploadImageProps<T>,
  ref: React.Ref<UploadImageRefType>,
) {
  const fetchRef = useRef(0);
  const reqRef = useGetProp(customRequest);
  const changeRef = useGetProp(onChange);
  const beforeUploadRef = useGetProp(beforeUpload);
  const checkFnsRef = useGetProp(checkFns);
  const [values, setValues, getValues] = useGetState<UploadImageValuesType>({});
  const [loading, setLoading] = useState(false);
  const onImgLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const target = event.target as HTMLImageElement;
      const { width, height } = target;
      if (width > height) {
        target.style.height = 'auto';
        target.style.width = '100%';
      } else {
        target.style.height = '100%';
        target.style.width = 'auto';
      }
    },
    [],
  );
  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setLoading(false);
        setValues({});
        changeRef()?.({});
      },
    }),
    [],
  );
  useEffect(() => {
    const wright = typeof value === 'object' && value !== null;
    setValues(wright ? value : {});
    if (wright) {
      if (value.id != undefined && !value.url) {
        const now = Date.now();
        fetchRef.current = now;
        // request
        //     .getSourceUrlById({ type: 'img', id: value.id })
        //     .then(({ success, data }) => {
        //         if (success && fetchRef.current === now) {
        //             const res = { ...getValues(), url: data.url };
        //             setValues(res);
        //             changeRef()?.(res);
        //         }
        //     });
      }
    }
  }, [value]);
  const fileList = useMemo(() => {
    return values.url
      ? [
          {
            thumbUrl: values.url,
            tatus: 'done',
            name: getFileNameByUrl(values.url),
            uid: uuid(),
          },
        ]
      : [];
  }, [values]);
  const remove = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      event.persist();
      event.stopPropagation();
      setValues({});
      changeRef()?.({});
    },
    [onChange],
  );
  const beforeUploadfn = useCallback(
    async (file: RcFile, FileList: RcFile[]) => {
      if (beforeUploadRef()) return beforeUploadRef()(file, FileList);
      if (FileList.length > maxCount)
        return message.error(`逻辑错误，最多可上传${maxCount}个文件`), false;
      const img = await loadImage(file);
      if (!img) return message.error('获取图片信息失败'), false;
      if (checkFnsRef()?.length) {
        return checkImageList(file, img, checkFnsRef());
      }

      return true;
    },
    [],
  );
  const customRequestfn = useCallback(
    async (options: UploadRequestOption) => {
      if (loading) return;
      setLoading(true);
      if (isFunction(reqRef())) {
        await reqRef()(options);
        setLoading(false);
        return;
      }
      const file = options.file as any;
      request
        .upload({ bizType: 'COMMON', fileCount: maxCount, file })
        .then(({ success, data }) => {
          setLoading(false);
          if (success) {
            const res = { url: data.url, id: data.id };
            setValues(res);
            changeRef()?.(res);
            options.onSuccess?.({});
          } else {
            message.error(`上传失败：${(data as any)?.message}`);
            options.onError?.(new Error('上传失败'));
          }
        });
    },
    [loading],
  );
  return (
    <div
      className={classNames(styles.upload, className, styles[`upload-${size}`])}
      style={wrapperStyle}
    >
      <Dragger
        listType="picture-card"
        maxCount={maxCount}
        beforeUpload={beforeUploadfn}
        customRequest={customRequestfn}
        showUploadList={false}
        fileList={fileList}
        disabled={loading || disabled}
        accept={accept?.join?.(', ')}
        {...restProps}
      >
        {disabled ? null : <DeleteOutlined onClick={remove} />}
        {children ? (
          children
        ) : values.url ? (
          <div className={styles.img}>
            <img
              src={values.url}
              alt="upload"
              onLoad={onImgLoad}
              draggable={false}
            />
          </div>
        ) : (
          <PlusOutlined style={{ fontSize: '60px' }} />
        )}
      </Dragger>
    </div>
  );
}

export default memo(forwardRef(UploadImage)) as <T = any>(
  props: UploadImageProps<T> & { ref?: React.Ref<UploadImageRefType> },
) => React.ReactElement;
