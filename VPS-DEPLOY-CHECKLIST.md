# GearForge — VPS Production Deploy Checklist

> [!CAUTION]
> Thực hiện theo đúng 5 bước bên dưới khi đưa mã nguồn và CSDL từ Docker local (`http://localhost:8080`) lên VPS Ubuntu thật (HTTPS + Nginx + PHP 8.2 + MariaDB/MySQL).

## Bước 1 — Bảo mật Vault, Secrets & Quyền Thư Mục
- Chuyển `gf-vault` ra khỏi webroot (ví dụ `/var/lib/gf-vault`), đặt biến môi trường `GF_VAULT_DIR=/var/lib/gf-vault` và `GF_VAULT_KEY` mới (rotate key nếu từng chạy file test trên repo):
  ```bash
  sudo mv /var/www/gf-vault /var/lib/gf-vault
  sudo chown -R www-data:www-data /var/lib/gf-vault
  sudo chmod 700 /var/lib/gf-vault
  sudo chmod 600 /var/lib/gf-vault/*.enc
  ```
- Xóa các file test `tc06_*.enc` khỏi môi trường thật trước khi go-live.
- Đặt `.env` ngoài webroot với quyền `chmod 600`.
- Trong `wp-config.php`: bật `WP_DEBUG = false`, `WP_DEBUG_DISPLAY = false`, `DISALLOW_FILE_EDIT = true`, `FORCE_SSL_ADMIN = true`, chạy `wp config shuffle-salts`.

## Bước 2 — Cấu Hình Nginx & Cloudflare Real-IP + Video 4K Streaming
- Thêm block tối thiểu vào server block HTTPS của Nginx:
  ```nginx
  # 1. Lấy đúng IP thật qua Cloudflare/Proxy để Role 4 Rate-Limit & Blacklist IP hoạt động chính xác
  set_real_ip_from 173.245.48.0/20;
  set_real_ip_from 103.21.244.0/22;
  set_real_ip_from 104.16.0.0/13;
  real_ip_header CF-Connecting-IP;
  real_ip_recursive on;

  # 2. Chặn tuyệt đối vault, dotfiles, xmlrpc, wp-config
  location ^~ /gf-vault/ { deny all; return 404; }
  location ~* \.(enc|key|pem|sql|bak|log)$ { deny all; }
  location ~ /\.(?!well-known) { deny all; }
  location = /xmlrpc.php { deny all; }

  # 3. Tối ưu 8 video 4K 60fps MP4 (HTTP 206 Byte-Range, cache dài, tắt gzip video)
  location ~* \.(mp4|webm)$ {
    mp4;
    add_header Accept-Ranges bytes;
    add_header Cache-Control "public, max-age=31536000, immutable";
    gzip off;
    sendfile on;
    tcp_nopush on;
  }

  # 4. Cache tĩnh JS/CSS/ảnh Flagship
  location ~* \.(css|js|jpg|jpeg|png|webp|svg|woff2)$ {
    add_header Cache-Control "public, max-age=2592000";
  }
  ```
- Bật **Cloudflare Cache Rule** (hoặc R2/CDN) cho đường dẫn `*/assets/flagship/vibe/videos/*.mp4` để tránh nghẽn băng thông gốc VPS khi phát video 4K Hero (~80 MB).

## Bước 3 — Migrate Database & Rewrite Domain HTTPS
- Backup DB trước khi chạy:
  ```bash
  mysqldump --single-transaction --routines --triggers gearforge_db > backup_before_deploy.sql
  ```
- Thay domain chuẩn (hỗ trợ PHP serialized object, kiểm tra `--dry-run` trước):
  ```bash
  wp search-replace 'http://localhost:8080' 'https://your-domain.vn' --all-tables-with-prefix --precise --recurse-objects --dry-run
  wp search-replace 'http://localhost:8080' 'https://your-domain.vn' --all-tables-with-prefix --precise --recurse-objects
  wp rewrite flush --hard
  ```
- Đảm bảo `wp option get users_can_register` là `0` (hoặc cấu hình đăng ký qua WooCommerce My Account).

## Bước 4 — SSL, WP-Cron Hệ Thống & Build Frontend
- Cấp chứng chỉ SSL + gia hạn tự động:
  ```bash
  sudo certbot --nginx -d your-domain.vn -d www.your-domain.vn
  ```
- Chuyển WP-Cron sang Linux Crontab (`DISABLE_WP_CRON = true` trong `wp-config.php`):
  ```cron
  */5 * * * * cd /var/www/html && wp cron event run --due-now --quiet
  ```
- Kiểm tra lại build Flagship bằng `pnpm`:
  ```bash
  pnpm --dir /var/www/html/wp-content/themes/gearforge-child/flagship-src run build
  ```

## Bước 5 — Kiểm Chứng Sau Deploy (Smoke Test Bắt Buộc)
1. Chạy full test suite Role 4 FIX-16 trên VPS:
   ```bash
   php /var/www/html/wp-content/plugins/gearforge-core/tests/verify-role4.php
   ```
   Bắt buộc: `0 failed`.
2. Kiểm tra `curl -I https://your-domain.vn/wp-content/themes/gearforge-child/assets/flagship/vibe/videos/gf-hero-riot-1080p.mp4` trả `200`/`206` kèm `Accept-Ranges: bytes` và `X-Content-Type-Options: nosniff`.
3. Test trình duyệt thực tế luồng: `/shop/` -> Thêm giỏ -> `/checkout/` -> Sandbox 3DS (`OTP 123456`) -> redirect về `/tra-cuu-don-hang/?order_id=<ID>&gf_paid=1` -> xuất hiện banner thanh toán + đơn thật từ server + tải PDF T-VAN không lỗi CSP/mixed content.
