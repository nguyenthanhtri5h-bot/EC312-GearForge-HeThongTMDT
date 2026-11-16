const LAPTOPS = [
  {
    id: 1,
    name: "ASUS Vivobook 15 OLED (16GB / 512GB)",
    seg: "van-phong",
    cpu: "Core i5-13500H",
    ram: "16GB",
    gpu: "Intel Iris Xe",
    ssd: "512GB NVMe",
    screen: "15.6\" OLED FHD",
    weight: "1.7 kg",
    price: 15990000,
    oldPrice: 16990000
  },
  {
    id: 2,
    name: "Lenovo LOQ 15IAX9 Gaming (16GB / 512GB)",
    seg: "gaming",
    cpu: "Core i5-12450HX",
    ram: "16GB",
    gpu: "RTX 3050 6GB",
    ssd: "512GB NVMe",
    screen: "15.6\" FHD 144Hz",
    weight: "2.38 kg",
    price: 19990000,
    oldPrice: 20990000
  },
  {
    id: 3,
    name: "Acer Nitro V 15 (16GB / 1TB SSD)",
    seg: "gaming",
    cpu: "Core i5-13420H",
    ram: "16GB",
    gpu: "RTX 4050 6GB",
    ssd: "1TB NVMe",
    screen: "15.6\" FHD 144Hz",
    weight: "2.1 kg",
    price: 22490000,
    oldPrice: 23990000
  },
  {
    id: 4,
    name: "MacBook Air M3 15\" (16GB / 512GB)",
    seg: "do-hoa",
    cpu: "Apple M3",
    ram: "16GB",
    gpu: "Apple GPU 10-core",
    ssd: "512GB SSD",
    screen: "15.3\" Liquid Retina",
    weight: "1.51 kg",
    price: 31990000,
    oldPrice: 32990000
  },
  {
    id: 5,
    name: "Lenovo Legion Slim 5 (32GB / 1TB)",
    seg: "do-hoa",
    cpu: "Ryzen 7 7840HS",
    ram: "32GB",
    gpu: "RTX 4060 8GB",
    ssd: "1TB NVMe",
    screen: "16\" WQXGA 165Hz",
    weight: "2.4 kg",
    price: 34990000,
    oldPrice: 36490000
  },
  {
    id: 6,
    name: "MSI Modern 14 C13M (16GB / 512GB)",
    seg: "van-phong",
    cpu: "Core i5-1335U",
    ram: "16GB",
    gpu: "Intel Iris Xe",
    ssd: "512GB NVMe",
    screen: "14\" FHD IPS",
    weight: "1.4 kg",
    price: 12990000,
    oldPrice: 13990000
  }
];

const FRAME_TITLES = {
  "uc01": "[UC-01] Home_Category_Filter",
  "uc02": "[UC-02] Compare_Specs_3Devices",
  "uc10": "[UC-10] ProductDetail_InstallmentWidget",
  "uc08-checkout": "[UC-08] Cart_Checkout_ConsentND13",
  "uc08-oms": "[UC-08] OMS_OrderTracking",
  "uc11": "[UC-11] Admin_Review_Serial"
};

function fmtVnd(n) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

function calcInstallment(price, downPct, months) {
  const rates = { 3: 0, 6: 1.2, 12: 1.5 };
  const down = Math.round(price * (downPct / 100));
  const loan = price - down;
  const interest = Math.round(loan * ((rates[months] ?? 1.2) / 100) * months);
  const monthly = Math.round((loan + interest) / months / 1000) * 1000;
  return { down, loan, monthly };
}

const laptopSvg = `
<svg width="168" height="106" viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="34" y="14" width="172" height="104" rx="8" fill="#0F172A" stroke="#334155" stroke-width="2"/>
  <rect x="42" y="22" width="156" height="88" rx="4" fill="#0066FF"/>
  <polygon points="42,22 130,22 86,110 42,110" fill="white" fill-opacity="0.12"/>
  <path d="M18 118H222L232 132H8L18 118Z" fill="#CBD5E1"/>
  <rect x="96" y="122" width="48" height="4" rx="2" fill="#64748B"/>
</svg>`;

let currentSeg = "all";

function renderProducts() {
  const grid = document.getElementById("proto-product-grid");
  const filtered = currentSeg === "all" ? LAPTOPS : LAPTOPS.filter(p => p.seg === currentSeg);
  grid.innerHTML = filtered.map(p => {
    const c = calcInstallment(p.price, 20, 3);
    return `
      <article class="p-card">
        <div class="p-thumb">${laptopSvg}</div>
        <div class="p-title">${p.name}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          <span class="chip">${p.cpu}</span>
          <span class="chip">${p.ram}</span>
          <span class="chip">${p.gpu}</span>
        </div>
        <div class="p-price tabular">${fmtVnd(p.price)}<s>${fmtVnd(p.oldPrice)}</s></div>
        <div style="font-size:12px;font-weight:600;color:var(--emerald);">Góp SV 0%: ${fmtVnd(c.monthly)}/th</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:auto;">
          <button class="btn btn-primary" onclick="switchScreen('uc10')">Tính góp</button>
          <button class="btn btn-outline" onclick="switchScreen('uc02')">+ So sánh</button>
        </div>
      </article>
    `;
  }).join("");
}

function updateCalc() {
  const price = 19990000;
  const downPct = Number(document.getElementById("calc-down").value);
  const months = Number(document.getElementById("calc-months").value);
  const res = calcInstallment(price, downPct, months);
  document.getElementById("kpi-down").textContent = fmtVnd(res.down);
  document.getElementById("kpi-loan").textContent = fmtVnd(res.loan);
  document.getElementById("kpi-monthly").textContent = fmtVnd(res.monthly) + "/th";
}

function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
  document.getElementById("screen-" + id).classList.add("is-active");
  document.querySelectorAll(".studio-tab").forEach(b => b.classList.toggle("is-active", b.dataset.screen === id));
  document.getElementById("frame-label").textContent = FRAME_TITLES[id] || id;
}

window.switchScreen = switchScreen;

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCalc();

  document.querySelectorAll(".studio-tab").forEach(btn => {
    btn.addEventListener("click", () => switchScreen(btn.dataset.screen));
  });

  document.querySelectorAll(".vp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".vp-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const isMobile = btn.dataset.vp === "mobile";
      document.getElementById("artboard").classList.toggle("is-mobile", isMobile);
      document.getElementById("vp-label").textContent = isMobile ? "Mobile 375px" : "Desktop 1320px";
    });
  });

  document.querySelectorAll("[data-seg]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-seg]").forEach(b => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      currentSeg = btn.dataset.seg;
      renderProducts();
    });
  });

  document.getElementById("calc-down").addEventListener("change", updateCalc);
  document.getElementById("calc-months").addEventListener("change", updateCalc);

  const consentCheck = document.getElementById("proto-consent-check");
  const submitBtn = document.getElementById("proto-submit-app");
  consentCheck.addEventListener("change", () => {
    submitBtn.disabled = !consentCheck.checked;
  });
  submitBtn.addEventListener("click", () => {
    document.getElementById("proto-checkout-status").innerHTML =
      '<div class="chip chip-ok" style="padding:8px 12px;">Hồ sơ đã mã hóa AES-256-CBC &amp; tạo đơn PENDING_INSTALLMENT_APPROVAL</div>';
  });

  document.getElementById("admin-l1-btn").addEventListener("click", () => {
    document.getElementById("admin-app-status").className = "chip chip-warn";
    document.getElementById("admin-app-status").textContent = "L1_DOCS_VERIFIED";
    document.getElementById("admin-l2-btn").disabled = false;
  });
  document.getElementById("admin-l2-btn").addEventListener("click", () => {
    document.getElementById("admin-app-status").className = "chip chip-ok";
    document.getElementById("admin-app-status").textContent = "APPROVED_WAITING_DOWNPAYMENT";
  });
  document.getElementById("admin-ship-btn").addEventListener("click", () => {
    const sn = document.getElementById("admin-sn-input").value.trim();
    const out = document.getElementById("admin-sn-msg");
    if (!sn) {
      out.className = "chip chip-err";
      out.textContent = "CHẶN XUẤT KHO: Bắt buộc nhập S/N trước khi chuyển SHIPPING!";
    } else {
      out.className = "chip chip-ok";
      out.textContent = "SERIAL_ASSIGNED (" + sn + ") -> Đã mở khóa SHIPPING & Hóa đơn PDF T-VAN";
    }
  });
});
