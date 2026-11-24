import { Fragment } from 'react';

const LINE_1 = [
  'Laptop Gaming & Workstation AI',
  'Trả góp 0% Sinh viên ĐHQG-HCM',
  'Duyệt hồ sơ nhanh qua .edu.vn',
  'Theo dõi tiến độ đơn hàng 24/7',
  'Bảo hành điện tử chính hãng 36 tháng',
];

const LINE_2 = [
  'ASUS ROG · Lenovo Legion · MSI',
  'NVIDIA GeForce RTX 40/50 Series',
  'Giao hỏa tốc KTX 2 giờ',
  'Coupon BACKTOSCHOOL -5%',
];

export function MarqueeRibbon() {
  const copies = [0, 1, 2, 3];
  return (
    <div className="tc-bang" aria-hidden="true">
      <div className="tc-bang-1">
        <div className="tc-bang-ray" data-chay="-1">
          {copies.map((c) => (
            <Fragment key={c}>
              {LINE_1.map((text) => (
                <Fragment key={`${c}-${text}`}>
                  <span>{text}</span>
                  <i>✦</i>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="tc-bang-2">
        <div className="tc-bang-ray" data-chay="1">
          {copies.map((c) => (
            <Fragment key={c}>
              {LINE_2.map((text) => (
                <Fragment key={`${c}-${text}`}>
                  <span>{text}</span>
                  <i>✦</i>
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
