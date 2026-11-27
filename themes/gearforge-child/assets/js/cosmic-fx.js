/**
 * GearForge Cosmic 3D Secondary Micro-Interactions (Product / Cart / Checkout / Compare / OMS / Account)
 * Pure progressive JS effects: top scroll progress beam + 60 FPS GPU perspective tilt + sheen.
 */
(function () {
  var bar = document.createElement('div');
  bar.id = 'gf-scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText =
    'position:fixed;top:calc(80px + var(--wp-admin--admin-bar--height, 0px));left:0;height:2px;width:0%;z-index:960;pointer-events:none;' +
    'background:linear-gradient(90deg,#D13639,#EB0029);transition:width 80ms linear;';
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(bar);
    function updateScrollBar() {
      var doc = document.documentElement;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      var pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      bar.style.width = pct.toFixed(1) + '%';
    }
    window.addEventListener('scroll', updateScrollBar, { passive: true });
    updateScrollBar();

    document.querySelectorAll('.gf-empty-state a').forEach(function (link) {
      var rawHref = link.getAttribute('href') || '';
      if (rawHref === '/' || rawHref === window.location.origin + '/' || link.pathname === '/') {
        link.setAttribute('href', '/shop/');
      }
    });

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var cards = document.querySelectorAll(
      '.related.products li.product, #gf-installment-widget, .gf-oms-box, .gf-compare-wrapper'
    );
    cards.forEach(function (card) {
      if (card.matches('.gf-oms-box, .gf-compare-wrapper')) return;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = ((0.5 - py) * 4).toFixed(2);
        var ry = ((px - 0.5) * 4).toFixed(2);
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        card.style.transition = 'transform 160ms cubic-bezier(0.22,1,0.36,1)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  });
})();
