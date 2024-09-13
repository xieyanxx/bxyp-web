/*
 * @Description 主表单在一个modal里，其他表单在嵌套在主表单中
 */
import ChildModalForm from './Child';
import NestedModalForm from './Main';
import type {
  ChildFormRef,
  NamePath,
  NestedFormRef,
  ValidateErrorInfo,
} from './utils';

export type { ChildFormRef, NamePath, NestedFormRef, ValidateErrorInfo };

export { ChildModalForm, NestedModalForm };
