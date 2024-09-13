import { AsyncBtnModal } from '@/components/Modal';
import { useGetProp } from '@/hooks';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { memo, useCallback, useState } from 'react';

type LocationType = {
  lat: number;
  lng: number;
};

function AddOneMarker({
  initalPos,
  onChange,
  defultAddress,
}: {
  /**
   * @name 初始位置
   * @description 每次打开重置一次
   */
  initalPos?: () => void;
  onChange?: (value: any) => void;
  defultAddress?: string;
}) {
  const getInitalPos = useGetProp(initalPos);
  const getOnChange = useGetProp(onChange);
  const [location, setLocation] = useState<LocationType>({
    lat: 30.65984,
    lng: 104.10194,
  });
  const [address, setAddress] = useState<string>('');
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        const pre = initalPos?.() as any;
        if (pre) {
          setLocation(pre);
          initMap({ lat: pre.lat, lng: pre?.lng });
          setAddress(defultAddress || '');
        } else {
          initMap();
        }
      }
    },
    [address, location],
  );

  const onOk = useCallback(() => {
    getOnChange()?.(location);
  }, [location]);

  let map;
  const initMap = useCallback(
    (value?: LocationType) => {
      // 设置地图中心点坐标
      const TMap = window.qq.maps;
      let center;
      center = new TMap.LatLng(location.lat, location.lng);
      if (value) {
        center = new TMap.LatLng(value.lat, value.lng);
      }
      map = new TMap.Map(document.getElementById('container'), {
        center,
        zoom: 16,
        draggable: true,
        scrollwheel: true,
        disableDoubleClickZoom: true,
      });
      const marker = new TMap.Marker({
        position: center,
        map: map,
      });
      TMap.event.addListener(map, 'click', function (event: any) {
        marker.setPosition(event.latLng);
        setLocation(event.latLng);
        new TMap.Geocoder({
          complete: function (result: any) {
            const { nearPois, addressComponents } = result.detail;
            const streetNumber = addressComponents.streetNumber;
            const street = addressComponents.street;
            const city = addressComponents.city;
            const district = addressComponents.district;
            const town = addressComponents.town;
            const point = nearPois[0].name;
            //获取到当前定位的位置文本并赋值到搜索框中
            let mapAddress = `${city ? city : ''}${district ? district : ''}${
              town ? town : ''
            }${streetNumber ? streetNumber : street}${point ? point : ''}`;
            setAddress(mapAddress);
          },
        }).getAddress(new TMap.LatLng(event.latLng.lat, event.latLng.lng));
      });
    },
    [location],
  );
  // 根据地址搜索获取坐标
  const getLocationByAddress = () => {
    const TMap = window.qq.maps;
    let callbacks = {
      complete: (result: any) => {
        setLocation(result.detail.location);
        initMap(result.detail.location);
      },
    };
    new TMap.Geocoder(callbacks).getLocation(address);
  };

  return (
    <AsyncBtnModal
      btnType="primary"
      btnProps={{ icon: <EnvironmentOutlined />, shape: 'circle' }}
      onOpenChange={handleOpenChange}
      onOk={onOk}
      styles={{ body: { height: '100%' } }}
    >
      <div
        style={{ display: 'flex', gap: 20, width: '80%', marginBottom: '10px' }}
      >
        <Input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="请输入"
        />
        <Button onClick={() => getLocationByAddress()}>搜索</Button>
      </div>
      <div id="container" style={{ height: '300px' }}></div>
    </AsyncBtnModal>
  );
}

/**
 * @name 在地图上添加一个标记点并取得坐标，可拖拽修改标记点坐标
 */
export default memo(AddOneMarker);
