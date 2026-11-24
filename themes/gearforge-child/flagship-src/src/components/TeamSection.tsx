import { TEAM_COLUMNS } from '../data/sectionsData';
import { VIBE_BEAR_GUIDE } from '../data/vibeAssets';

export function TeamSection() {
  return (
    <section id="gf-team" className="dn" data-tuong="" aria-labelledby="dn-h">
      <div className="dn-tuong" aria-hidden="true" data-dn-tuong="">
        {TEAM_COLUMNS.map((col, colIdx) => (
          <div key={colIdx} className="dn-cot" data-cuon={col.dir}>
            {col.items.map((item, imgIdx) => (
              <figure key={`${colIdx}-${imgIdx}`}>
                <img src={item.src} loading="lazy" alt="Không gian phần cứng và góc học tập sinh viên ĐHQG-HCM" />
                {item.note && <span className="dn-note">{item.note}</span>}
              </figure>
            ))}
          </div>
        ))}
      </div>

      <div className="tc-wrap dn-wrap">
        <div className="dn-the">
          <h2 id="dn-h" className="tc-h2 dn-h">
            Đội ngũ kỹ thuật &amp; tư vấn tại <span className="tc-dan">Làng Đại học</span> luôn sẵn sàng
          </h2>
          <p className="tc-lede">
            Mỗi thiết bị rời kho đều được kiểm định phần cứng kỹ lưỡng và kích hoạt bảo hành điện tử theo từng số Serial.
          </p>
          <ul className="dn-vai">
            <li>
              <b>Kỹ sư phần cứng UIT</b>
              <span>tư vấn đúng GPU/RAM cho AI, CAD &amp; Gaming</span>
            </li>
            <li>
              <b>Thẩm định hồ sơ nhanh</b>
              <span>xác thực sinh viên .edu.vn &amp; bảo mật thông tin cá nhân</span>
            </li>
            <li>
              <b>Giao nhận &amp; bảo hành tận nơi</b>
              <span>kích hoạt bảo hành điện tử, hóa đơn VAT &amp; giao KTX 2h</span>
            </li>
          </ul>
          <div className="dn-ai">
            <img src={VIBE_BEAR_GUIDE.aiBadge} loading="lazy" alt="" />
            <span>và Trợ lý AI GearForge hỗ trợ tra cứu cấu hình 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
