## Mô tả thay đổi (Summary)
- Liên kết Issue / User Story: `#...` (`US-XX` / `UC-XX`)
- Vai trò thực hiện: `[ ] Role 1 (PO)` | `[ ] Role 2 (SM)` | `[ ] Role 3 (Dev 1)` | `[ ] Role 4 (Dev 2)`

## Checklist bắt buộc trước khi Merge (Cổng kiểm duyệt 2 lớp)
- [ ] **Đồng nhất thuật ngữ:** Tên Actor, `UC-XX`, `OrderStatus`, `InstallmentApplicationStatus` và tên bảng `wp_gf_*` khớp 100% với `02_Shared_Specs_and_Standards/shared_domain_glossary.md`.
- [ ] **Bảo mật NĐ 13/2023 (nếu liên quan dữ liệu nhạy cảm):** Không hardcode khóa bí mật, không mở quyền truy cập public file CCCD/Thẻ SV, có Consent Banner.
- [ ] **Kiểm thử (QA):** Đã chạy qua các test case liên quan trong `04_Technical_and_QA_Skeleton/test_plan_skeleton.md` và không phát sinh lỗi nghiêm trọng.
- [ ] **Tài liệu:** Đã cập nhật tiến độ vào `01_Project_Management/task_plan.md` (nếu hoàn thành hạng mục).
