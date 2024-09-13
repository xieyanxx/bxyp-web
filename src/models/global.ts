// 全局共享数据示例
import { useState } from 'react';

type farmIndfoType = {
  hasFarm: boolean;
  myFarmInfoList: { id: number; name: string }[];
};
const useFarmInfo = () => {
  // const [name, setName] = useState<string>('');
  const [farmInfo, setFarmInfo] = useState<farmIndfoType>();
  const [farmId, setFarmId] = useState<number>();
  const [farmName, setFarmName] = useState<string>('');
  return {
    farmInfo,
    setFarmInfo,
    setFarmId,
    farmId,
    setFarmName,
    farmName,
  };
};

export default useFarmInfo;
