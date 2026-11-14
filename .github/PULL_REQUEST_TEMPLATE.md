## Mô tả thay đổi (Summary)
- Liên kết Issue / User Story: `#...` (`US-XX` / `UC-XX`)
- Vai trò & Nhánh gửi PR:
  - `[ ] Role 1 (PO)` – nhánh `role1-data-catalog`
  - `[ ] Role 2 (SM)` – nhánh `role2-security-qa`
  - `[ ] Role 3 (Dev 1)` – nhánh `role3-ui-frontend`
  - `[ ] Role 4 (Dev 2)` – nhánh `role4-backend-payment`

## Checklist bắt buộc trước khi Merge (Chống đè file & Kiểm duyệt 2 lớp)
- [ ] **Đúng vùng lãnh thổ & Không đè nhánh:** Pull Request xuất phát từ đúng nhánh `roleX-...` vào `main`; không chỉnh sửa chéo file độc quyền của Role khác.
- [ ] **Đồng nhất thuật ngữ:** Tên Actor, `UC-XX`, `OrderStatus`, `InstallmentApplicationStatus` và tên bảng `wp_gf_*` khớp 100% với `2. Quy ước và Sơ đồ UML/Từ điển thuật ngữ và Ma trận Fit-Gap.md`.
- [ ] **Bảo mật NĐ 13/2023 (nếu liên quan dữ liệu nhạy cảm):** Không hardcode khóa bí mật, không commit `.env` hay file trong `gf-vault/`, không mở quyền public ảnh CCCD/Thẻ SV, có Consent Banner.
- [ ] **Kiểm thử (QA):** Đã chạy qua các test case liên quan trong `4. Kỹ thuật và Kiểm thử/Kế hoạch kiểm thử 16 Test Cases.md` và không phát sinh lỗi nghiêm trọng.
- [ ] **Tài liệu:** Đã cập nhật tiến độ vào `1. Quản lý nhóm và Phân vai/Kế hoạch 4 Sprints và Chia việc.md` (nếu hoàn thành hạng mục).
