import json
import time
import urllib.error
import urllib.request

BASE = "http://localhost:8080"


def fetch(path: str):
    t0 = time.perf_counter()
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "GearForgeQA/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.status, body, time.perf_counter() - t0
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), time.perf_counter() - t0


def main():
    checks = []

    # 1. Home page speed & GearForge branding
    code, body, dt = fetch("/")
    checks.append(("HTTP-HOME", code == 200 and "GearForge" in body and dt < 3.0, f"HTTP {code}, {dt:.3f}s"))

    # 2. Shop page speed & actual WooCommerce products rendered (not Coming Soon)
    code, body, dt = fetch("/shop/")
    checks.append(("HTTP-SHOP", code == 200 and "gf-add-compare" in body and "Great things are on the horizon" not in body and dt < 3.0, f"HTTP {code}, {dt:.3f}s"))

    # 3. Compare Specs page
    code, body, dt = fetch("/so-sanh-cau-hinh/")
    checks.append(("HTTP-COMPARE", code == 200 and "So sánh cấu hình" in body, f"HTTP {code}, {dt:.3f}s"))

    # 4. REST API Installment Calculator (TC-12 over HTTP)
    code, body, dt = fetch("/wp-json/gearforge/v1/installment-calc?price=20000000&down_pct=30&months=6")
    data = json.loads(body) if code == 200 else {}
    ok_calc = code == 200 and data.get("downpayment_amount") == 6000000 and data.get("monthly_amount") == 2501000
    checks.append(("REST-CALC-TC12", ok_calc, f"HTTP {code}, payload={data}"))

    # 5. Vault isolation check (TC-06 over HTTP: /gf-vault/ must not be served publicly)
    code, _, _ = fetch("/gf-vault/audit.log")
    checks.append(("HTTP-VAULT-BLOCKED", code in (403, 404), f"HTTP {code} (expected 403/404)"))

    # 6. Unauthenticated installment submission denied (401/403)
    req = urllib.request.Request(
        BASE + "/wp-admin/admin-ajax.php?action=gf_submit_installment_app",
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            unauth_code = resp.status
    except urllib.error.HTTPError as e:
        unauth_code = e.code
    checks.append(("HTTP-UNAUTH-DENIED", unauth_code in (401, 403), f"HTTP {unauth_code}"))

    # 7. Legal footer pages exist (FR-03)
    for slug in ["/chinh-sach-bao-hanh/", "/chinh-sach-doi-tra/", "/chinh-sach-bao-mat-nd13/", "/dieu-khoan-su-dung/"]:
        c, _, _ = fetch(slug)
        checks.append((f"HTTP-LEGAL-{slug.strip('/')}", c == 200, f"HTTP {c}"))

    passed = sum(1 for _, ok, _ in checks if ok)
    for name, ok, info in checks:
        print(f"[{'PASS' if ok else 'FAIL'}] {name}: {info}")
    print(f"\nHTTP SUMMARY: {passed}/{len(checks)} checks passed.")
    raise SystemExit(0 if passed == len(checks) else 1)


if __name__ == "__main__":
    main()
