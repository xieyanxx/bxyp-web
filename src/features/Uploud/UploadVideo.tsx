/**
 * 上传单个图片组件，封装了接口。value支持sourceid和url，都支持预览
 */
import { request } from '@/helper/services/request';
import { useGetProp } from '@/hooks';
import { getFileNameByUrl, uuid } from '@/utils';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/lib/upload';
import classNames from 'classnames';
import { isFunction } from 'lodash';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UploadAccept } from './const';
import styles from './file.less';
import type { UploadFileValueType } from './utils';
import { checkFilesList } from './utils';

export type UploadAudioProps<T = any> = {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  size?: PickShapeSize<'custom' | 'l' | 'm' | 's'>;
  value?: UploadFileValueType;
  disabled?: boolean;
  accept?: UploadAccept[];
  /**
   * @description: 检查文件是否符合要求，按顺序依次执行，失败立即退出
   */
  checkFns?: ((files: RcFile[]) => Promise<boolean>)[];
  onChange?: (data?: UploadFileValueType) => void;
  beforeUpload?: (file: RcFile, FileList: RcFile[]) => Promise<boolean>;
  customRequest?: (options: UploadRequestOption<T>) => Promise<any>;
  preview?: boolean;
} & Pick<UploadProps, 'progress' | 'onRemove'>;

const { Dragger } = Upload;

/**
 * @description: 上传单个音频文件组件，上传接口type为audio
 * ! 服务端暂不支持 audio
 */
function UplodAudio<T = any>({
  size = 's',
  value,
  accept = [UploadAccept.video],
  preview = true,
  disabled,
  checkFns,
  className,
  wrapperStyle,
  onChange,
  onRemove,
  beforeUpload,
  customRequest,
  ...restProps
}: UploadAudioProps<T>) {
  const fetchRef = useRef(0);
  const getCustomRequest = useGetProp(customRequest);
  const getOnChange = useGetProp(onChange);
  const getBeforeUpload = useGetProp(beforeUpload);
  const getCheckFns = useGetProp(checkFns);
  const [values, setValues] = useState<UploadFileValueType>();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (value?.id || value?.url) {
      setValues(value);
    }
    // if (value?.id && !value.url) {
    //     const now = Date.now();
    //     fetchRef.current = now;
    //     setLoading(true);
    //     request
    //         .getSourceUrlById({ type: 'audio', id: value.id })
    //         .then(({ success, data }) => {
    //             if (success && fetchRef.current === now) {
    //                 setValues((pre) => {
    //                     const res = { ...pre, url: data.url };
    //                     getOnChange()?.(res);
    //                     return res;
    //                 });
    //             }
    //         });
    // }
  }, [value]);
  const fileList = useMemo(
    () =>
      values
        ? [
            {
              tatus: 'done',
              name: getFileNameByUrl(values.url, 'xxx.mp4'),
              uid: uuid(),
            },
          ]
        : [],
    [values],
  );
  const beforeUploadfn = useCallback(
    async (file: RcFile, fileList: RcFile[]) => {
      if (getBeforeUpload()) return getBeforeUpload()(file, fileList);
      if (getCheckFns()?.length) {
        return checkFilesList([file], getCheckFns());
      }
      return true;
    },
    [],
  );
  const customRequestfn = useCallback(
    async (options: UploadRequestOption) => {
      if (loading) return;
      setLoading(true);
      if (isFunction(getCustomRequest())) {
        await getCustomRequest()(options);
        setLoading(false);
        return;
      }
      const file = options.file as any;
      request
        .upload({ file, bizType: 'COMMON', fileCount: 3 })
        .then(({ success, data }) => {
          setLoading(false);
          if (success) {
            const res = { url: data.url, id: data.id };
            setValues(res);
            getOnChange()?.(res);
            options.onSuccess?.({});
          } else {
            message.error(`上传失败：${(data as any)?.message}`);
            options.onError?.(new Error('上传失败'));
          }
        });
    },
    [loading],
  );
  const handleRemove = useCallback(
    (file: UploadFile) => {
      if (onRemove) return onRemove(file);
      setValues(undefined);
      getOnChange()?.();
      return true;
    },
    [onRemove],
  );
  return (
    <div
      className={classNames(styles.upload, className, styles[`upload-${size}`])}
      style={wrapperStyle}
    >
      <Dragger
        listType="text"
        maxCount={1}
        beforeUpload={beforeUploadfn}
        customRequest={customRequestfn}
        showUploadList
        fileList={fileList}
        disabled={loading || disabled}
        accept={accept?.join?.(', ')}
        onRemove={handleRemove}
        {...restProps}
      >
        {loading ? (
          <LoadingOutlined style={{ fontSize: '40px' }} />
        ) : (
          <UploadOutlined style={{ fontSize: '40px' }} />
        )}
      </Dragger>
      {values?.url ? (
        <video
          src={values?.url}
          style={{ height: '200px', width: '400px', overflow: 'hidden' }}
          controls
        />
      ) : null}
    </div>
  );
}

export default memo(UplodAudio);
