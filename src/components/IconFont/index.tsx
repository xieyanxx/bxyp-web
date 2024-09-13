import Add from '@/assets/images/icons/Add.png';
import AddBusiness from '@/assets/images/icons/AddBusiness.png';
import AddGroup from '@/assets/images/icons/AddGroup.png';
import AddRole from '@/assets/images/icons/AddRole.png';
import AddUser from '@/assets/images/icons/AddUser.png';
import ArrowDown from '@/assets/images/icons/ArrowDown.png';
import ArrowLeft from '@/assets/images/icons/ArrowLeft.png';
import ArrowRight from '@/assets/images/icons/ArrowRight.png';
import BrokenLine from '@/assets/images/icons/BrokenLine.png';
import BrokenLineActive from '@/assets/images/icons/BrokenLineActive.png';
import Columnar from '@/assets/images/icons/Columnar.png';
import ColumnarActive from '@/assets/images/icons/ColumnarActive.png';
import Construction from '@/assets/images/icons/Construction.png';
import ConstructionActive from '@/assets/images/icons/ConstructionActive.png';
import Data from '@/assets/images/icons/Data.png';
import DataActive from '@/assets/images/icons/DataActive.png';
import Date from '@/assets/images/icons/Date.png';
import Delete from '@/assets/images/icons/Delete.png';
import Edit from '@/assets/images/icons/Edit.png';
import Ellipsis from '@/assets/images/icons/Ellipsis.png';
import Folder from '@/assets/images/icons/Folder.png';
import Form from '@/assets/images/icons/Form.png';
import Info from '@/assets/images/icons/Info.png';
import Link from '@/assets/images/icons/Link.png';
import List from '@/assets/images/icons/List.png';
import Lock from '@/assets/images/icons/Lock.png';
import MergeIntersection from '@/assets/images/icons/MergeIntersection.png';
import MergeLeft from '@/assets/images/icons/MergeLeft.png';
import MergeRight from '@/assets/images/icons/MergeRight.png';
import MergeSum from '@/assets/images/icons/MergeSum.png';
import PaperPlus from '@/assets/images/icons/PaperPlus.png';
import Pie from '@/assets/images/icons/Pie.png';
import PieActive from '@/assets/images/icons/PieActive.png';
import Plus from '@/assets/images/icons/Plus.png';
import Ring from '@/assets/images/icons/Ring.png';
import RingActive from '@/assets/images/icons/RingActive.png';
import Slide from '@/assets/images/icons/Slide.png';
import Strip from '@/assets/images/icons/Strip.png';
import StripActive from '@/assets/images/icons/StripActive.png';
import Swap from '@/assets/images/icons/Swap.png';
import Table from '@/assets/images/icons/Table.png';
import TableActive from '@/assets/images/icons/TableActive.png';
import Tag from '@/assets/images/icons/Tag.png';
import UnLock from '@/assets/images/icons/UnLock.png';
import User from '@/assets/images/icons/User.png';
import UserGroup from '@/assets/images/icons/UserGroup.png';
import React from 'react';

const iconTypes = {
  Add,
  AddBusiness,
  AddGroup,
  AddRole,
  AddUser,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BrokenLine,
  BrokenLineActive,
  Columnar,
  ColumnarActive,
  Construction,
  ConstructionActive,
  Data,
  DataActive,
  Date,
  Delete,
  Edit,
  Ellipsis,
  Folder,
  Form,
  Info,
  Link,
  List,
  Lock,
  MergeIntersection,
  MergeLeft,
  MergeRight,
  MergeSum,
  PaperPlus,
  Pie,
  PieActive,
  Plus,
  Ring,
  RingActive,
  Slide,
  Strip,
  StripActive,
  Swap,
  Table,
  TableActive,
  Tag,
  UnLock,
  User,
  UserGroup,
};

interface IconFontProps {
  type:
    | 'Add'
    | 'AddBusiness'
    | 'AddGroup'
    | 'AddRole'
    | 'AddUser'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'BrokenLine'
    | 'BrokenLineActive'
    | 'Columnar'
    | 'ColumnarActive'
    | 'Construction'
    | 'ConstructionActive'
    | 'Data'
    | 'DataActive'
    | 'Date'
    | 'Delete'
    | 'Edit'
    | 'Ellipsis'
    | 'Folder'
    | 'Form'
    | 'Info'
    | 'Link'
    | 'List'
    | 'Lock'
    | 'MergeIntersection'
    | 'MergeLeft'
    | 'MergeRight'
    | 'MergeSum'
    | 'PaperPlus'
    | 'Pie'
    | 'PieActive'
    | 'Plus'
    | 'Ring'
    | 'RingActive'
    | 'Slide'
    | 'Strip'
    | 'StripActive'
    | 'Swap'
    | 'Table'
    | 'TableActive'
    | 'Tag'
    | 'UnLock'
    | 'User'
    | 'UserGroup';
  size?: number;
  style?: React.CSSProperties;
}

const IconFont: React.FC<IconFontProps> = React.memo((props) => {
  const { type, size = 24, style, ...otherProps } = props;
  return (
    <img
      src={iconTypes[type]}
      style={{ width: size, height: size, ...style }}
      alt="icon"
      {...otherProps}
    />
  );
});

export default IconFont;
