/**
 * 上传单个图片组件，封装了接口。value支持sourceid和url，都支持预览
 */
import { request } from '@/helper/services/request';
import { useGetProp } from '@/hooks';
import { getFileNameByUrl, uuid } from '@/utils';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { useGetState } from 'ahooks';
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
import { checkFilesList } from './utils';

export type UplodFileProps<T = any> = {
  showUploadList?: boolean;
  maxCount?: number;
  className?: string;
  wrapperStyle?: React.CSSProperties;
  size?: PickShapeSize<'custom' | 'l' | 'm' | 's'>;
  value?: UploadFilesValueType;
  disabled?: boolean;
  accept?: UploadAccept[];
  /**
   * @description: 检查文件是否符合要求，按顺序依次执行，失败立即退出
   */
  checkFns?: ((files: RcFile[]) => Promise<boolean>)[];
  onChange?: (data: UploadFilesValueType) => void;
  beforeUpload?: (file: RcFile, FileList: RcFile[]) => Promise<boolean>;
  customRequest?: (options: UploadRequestOption<T>) => Promise<any>;
} & Pick<UploadProps, 'progress' | 'onRemove'>;
export type UploadFileValueType = { url?: string; id?: string };
export type UploadFilesValueType = UploadFileValueType[];
const { Dragger } = Upload;

/**
 * @description: 上传普通文件组件，上传接口type为common
 */
function UplodFile<T = any>({
  size = 's',
  value,
  accept = [UploadAccept.img],
  disabled,
  checkFns,
  className,
  maxCount = 1,
  wrapperStyle,
  onChange,
  beforeUpload,
  customRequest,
  onRemove,
  showUploadList = true,
  ...restProps
}: UplodFileProps<T>) {
  const fetchRef = useRef(0);
  const getCustomRequest = useGetProp(customRequest);
  const getOnChange = useGetProp(onChange);
  const getMaxCount = useGetProp(maxCount);
  const getBeforeUpload = useGetProp(beforeUpload);
  const getCheckFns = useGetProp(checkFns);
  const [values, setValues, getValues] = useGetState<UploadFileValueType[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const def = Array.isArray(value) ? value : [];
    setValues(def);
    const reset = def.filter((v) => v.id != undefined && !v.url);
    if (reset.length) {
      const now = Date.now();
      fetchRef.current = now;
      setLoading(true);
      Promise.all(
        value.map((v) => {
          if (v.url) return v;
          return request
            .getSourceUrlById({ type: 'common', id: v.id })
            .then(({ success, data }) => {
              if (success) {
                return {
                  id: v.id,
                  url: data.url,
                } as UploadFileValueType;
              } else {
                return { id: v.id } as UploadFileValueType;
              }
            });
        }),
      ).then((res) => {
        if (fetchRef.current === now) {
          setValues(res);
          getOnChange()?.(res);
          setLoading(false);
        }
      });
    }
  }, [value]);
  const fileList = useMemo(
    () =>
      values.map((v) => ({
        tatus: 'done',
        name: getFileNameByUrl(v.url),
        uid: uuid(),
      })),
    [values],
  );
  const beforeUploadfn = useCallback(
    async (file: RcFile, fileList: RcFile[]) => {
      if (getBeforeUpload()) return getBeforeUpload()(file, fileList);
      if (getCheckFns()?.length) {
        return checkFilesList(fileList, getCheckFns());
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
      request.upload({ file, type: 'common' }).then(({ success, data }) => {
        setLoading(false);
        if (success) {
          const res = { url: data.url, id: data.id };
          setValues(
            getMaxCount() > 1
              ? (pre) => {
                  const v = pre.concat(res);
                  getOnChange()?.(v);
                  return v;
                }
              : (getOnChange()?.([res]), [res]),
          );
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
      const res = getValues().filter((v) => !v.url.includes(file.name));
      const data = getMaxCount() > 1 ? res : [];
      setValues(data);
      getOnChange()(data);
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
        maxCount={maxCount}
        beforeUpload={beforeUploadfn}
        customRequest={customRequestfn}
        showUploadList={showUploadList}
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
    </div>
  );
}

export default memo(UplodFile);
