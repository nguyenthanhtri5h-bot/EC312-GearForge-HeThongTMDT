(function ($) {
    'use strict';

    var cfg = window.gfConfig || {};
    var activeCompareIds = [];
    var toastTimer = null;

    function formatVnd(amount) {
        return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
    }

    function syncRatioBar(downPct) {
        $('#gf-ratio-down').css('width', Math.min(80, Math.max(10, downPct)) + '%');
    }

    function calculateFallback(price, downPct, months) {
        var rates = { 3: 0, 6: 1.2, 12: 1.5 };
        var rate = Object.prototype.hasOwnProperty.call(rates, months) ? rates[months] : 1.2;
        var down = Math.round(price * (downPct / 100));
        var loan = Math.max(0, price - down);
        var interest = Math.round(loan * (rate / 100) * months);
        var monthly = months > 0 ? Math.round(((loan + interest) / months) / 1000) * 1000 : 0;
        return {
            downpayment_amount: down,
            loan_principal: loan,
            monthly_amount: monthly
        };
    }

    function applyCalcSummary(res) {
        if (!res || typeof res.monthly_amount === 'undefined') {
            return;
        }
        $('#gf-res-down').text(formatVnd(res.downpayment_amount));
        $('#gf-res-loan').text(formatVnd(res.loan_principal));
        $('#gf-res-monthly').text(formatVnd(res.monthly_amount) + '/th');
    }

    function updateCalculator() {
        var $widget = $('#gf-installment-widget');
        if (!$widget.length) {
            return;
        }

        var price = parseFloat($widget.data('price')) || 20000000;
        var downPct = parseFloat($('#gf-downpayment-pct').val()) || 30;
        var months = parseInt($('#gf-term-months').val(), 10) || 6;

        $('#gf-form-down-pct').val(downPct);
        $('#gf-form-months').val(months);
        syncRatioBar(downPct);

        if (!cfg.restUrl) {
            applyCalcSummary(calculateFallback(price, downPct, months));
            return;
        }

        $.getJSON(cfg.restUrl + '/installment-calc', {
            price: price,
            down_pct: downPct,
            months: months
        }).done(function (res) {
            applyCalcSummary(res);
        }).fail(function () {
            applyCalcSummary(calculateFallback(price, downPct, months));
        });
    }

    function isTrayHiddenPage() {
        var body = document.body;
        if (body) {
            var hiddenClasses = [
                'woocommerce-cart',
                'woocommerce-checkout',
                'woocommerce-order-received',
                'woocommerce-account',
                'page-so-sanh-cau-hinh',
                'page-tra-cuu-don-hang'
            ];
            for (var i = 0; i < hiddenClasses.length; i++) {
                if (body.classList.contains(hiddenClasses[i])) {
                    return true;
                }
            }
        }
        if ($('.gf-compare-wrapper, .gf-oms-box, form.woocommerce-checkout, form.woocommerce-cart-form').length > 0) {
            return true;
        }
        var path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
        return /\/(so-sanh-cau-hinh|tra-cuu-don-hang|cart|gio-hang|checkout|thanh-toan)(\/|$)/.test(path);
    }

    function showToast(msg) {
        if (!msg) {
            return;
        }
        var $toast = $('#gf-toast-notice');
        if (!$toast.length) {
            $toast = $('<div id="gf-toast-notice" class="gf-toast-notice" role="status" aria-live="polite"></div>').appendTo('body');
        }
        $toast.text(msg).stop(true, true).fadeIn(140);
        if (toastTimer) {
            window.clearTimeout(toastTimer);
        }
        toastTimer = window.setTimeout(function () {
            $toast.fadeOut(180);
        }, 3600);
    }

    function syncCompareButtons(items) {
        activeCompareIds = (items || []).map(function (it) {
            return Number(it.id);
        });
        $('.gf-add-compare').each(function () {
            var $btn = $(this);
            var pid = Number($btn.data('product-id'));
            var inList = activeCompareIds.indexOf(pid) !== -1;
            $btn.toggleClass('is-in-compare', inList);
            $btn.attr('aria-pressed', inList ? 'true' : 'false');
            if ($btn.hasClass('gf-btn-compare-card')) {
                $btn.text(inList ? 'Đã chọn' : '+ So sánh');
            }
        });
    }

    function renderTray(items) {
        syncCompareButtons(items);

        var $tray = $('#gf-compare-tray');
        var $items = $('#gf-tray-items');
        if (!$tray.length) {
            return;
        }

        if (isTrayHiddenPage() || !items || !items.length) {
            $tray.hide();
            $items.empty();
            $('#gf-tray-count').text(items ? items.length : 0);
            return;
        }

        $('#gf-tray-count').text(items.length);
        $items.empty();
        items.forEach(function (it) {
            var $chip = $('<div class="gf-tray-chip"></div>');
            $chip.append($('<span></span>').text(it.name + ' (' + it.price + ')'));
            var $rm = $('<button type="button" title="Xóa" aria-label="Xóa khỏi khay so sánh">&times;</button>').attr('data-product-id', it.id);
            $chip.append($rm);
            $items.append($chip);
        });
        $tray.css('display', 'flex');
    }

    function callCompare(mode, productId, reloadPage) {
        if (!cfg.ajaxUrl) {
            return;
        }
        $.post(cfg.ajaxUrl, {
            action: 'gf_compare_action',
            nonce: cfg.ajaxNonce,
            mode: mode,
            product_id: productId || 0
        }).done(function (resp) {
            if (resp && resp.success && resp.data) {
                renderTray(resp.data.items || []);
                if (reloadPage) {
                    window.location.reload();
                }
            }
        }).fail(function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message)
                ? xhr.responseJSON.data.message
                : 'Không thể cập nhật khay so sánh.';
            showToast(msg);
        });
    }

    function syncConsentState() {
        var $consent = $('#gf-consent-nd13');
        var $submitBtn = $('#gf-submit-installment-btn');
        if ($consent.length && $submitBtn.length) {
            $submitBtn.prop('disabled', !$consent.is(':checked'));
        }
    }

    $(function () {
        // Normalize card compare labels cleanly so 1-row card actions stay compact before AJAX sync
        $('.gf-btn-compare-card').each(function () {
            var $b = $(this);
            if ($b.text().trim() === '+ So sánh cấu hình') {
                $b.text('+ So sánh');
            }
        });

        // Initialize calculator & consent gate states cleanly on load
        syncConsentState();
        if ($('#gf-installment-widget').length) {
            var initialDown = parseFloat($('#gf-downpayment-pct').val()) || 30;
            var initialMonths = parseInt($('#gf-term-months').val(), 10) || 6;
            $('#gf-form-down-pct').val(initialDown);
            $('#gf-form-months').val(initialMonths);
            syncRatioBar(initialDown);
        }

        // Segmented pills synced to calculator selects
        $(document).on('click', '.gf-pill-btn', function () {
            var $btn = $(this);
            var target = $btn.data('target');
            var val = $btn.data('value');
            $btn.siblings('.gf-pill-btn').removeClass('is-active').attr('aria-pressed', 'false');
            $btn.addClass('is-active').attr('aria-pressed', 'true');
            if (target) {
                $(target).val(val).trigger('change');
            }
        });

        // Calculator select change
        $(document).on('change', '.gf-calc-input', updateCalculator);

        // Compare diff-only toggle (UC-02)
        $(document).on('change', '#gf-diff-only-toggle', function () {
            $('.gf-compare-table').toggleClass('is-diff-only', $(this).is(':checked'));
        });

        // NĐ 13/2023 Consent Banner toggle
        $(document).on('change', '#gf-consent-nd13', syncConsentState);

        // Student Installment Form Submit
        $(document).on('submit', '#gf-installment-app-form', function (e) {
            e.preventDefault();
            var $form = $(this);
            var $btn = $('#gf-submit-installment-btn');
            var $fb = $('#gf-app-feedback');

            if (!$('#gf-consent-nd13').is(':checked')) {
                $fb.removeClass('is-success').addClass('is-error')
                    .text('Bạn bắt buộc phải đồng ý điều khoản bảo vệ dữ liệu cá nhân (NĐ 13/2023).').show();
                return;
            }
            if (!cfg.ajaxUrl) {
                $fb.removeClass('is-success').addClass('is-error')
                    .text('Thiếu cấu hình kết nối máy chủ. Vui lòng tải lại trang.').show();
                return;
            }

            $btn.prop('disabled', true).text('Đang mã hóa AES-256 & gửi hồ sơ...');
            var fd = new FormData($form[0]);

            $.ajax({
                url: cfg.ajaxUrl,
                type: 'POST',
                data: fd,
                processData: false,
                contentType: false
            }).done(function (resp) {
                if (resp && resp.success && resp.data) {
                    $fb.removeClass('is-error').addClass('is-success').empty()
                        .append(document.createTextNode(resp.data.message + ' '))
                        .append(
                            $('<a></a>')
                                .attr('href', resp.data.tracking_url || '#')
                                .append($('<strong></strong>').text('Theo dõi đơn hàng OMS #' + resp.data.order_id))
                        )
                        .show();
                    $form[0].reset();
                    $('#gf-consent-nd13').prop('checked', false);
                    updateCalculator();
                }
            }).fail(function (xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message)
                    ? xhr.responseJSON.data.message
                    : 'Lỗi gửi hồ sơ trả góp.';
                $fb.removeClass('is-success').addClass('is-error').text(msg).show();
            }).always(function () {
                $btn.text('Nộp hồ sơ Trả góp Sinh viên');
                syncConsentState();
            });
        });

        // Compare tray controls
        if ($('#gf-compare-tray').length) {
            if (isTrayHiddenPage()) {
                $('#gf-compare-tray').hide();
            } else {
                callCompare('list', 0, false);
            }
        }
        $(document).on('click', '.gf-add-compare', function () {
            var pid = Number($(this).data('product-id'));
            if (!pid) {
                return;
            }
            var mode = $(this).hasClass('is-in-compare') ? 'remove' : 'add';
            callCompare(mode, pid, false);
        });
        $(document).on('click', '#gf-tray-items button', function () {
            callCompare('remove', $(this).data('product-id'), false);
        });
        $(document).on('click', '.gf-remove-compare', function () {
            callCompare('remove', $(this).data('product-id'), true);
        });
        $(document).on('click', '#gf-tray-clear, #gf-compare-reset', function () {
            callCompare('clear', 0, $('.gf-compare-wrapper').length > 0);
        });

        // Warranty / RMA request by S/N
        $(document).on('submit', '#gf-rma-form', function (e) {
            e.preventDefault();
            var $form = $(this);
            var $btn = $form.find('button[type="submit"]');
            var $msg = $('#gf-rma-msg');
            var orderId = $form.data('order-id');

            if (!cfg.restUrl) {
                $msg.css('color', '#B91C1C').text('Thiếu cấu hình REST API. Vui lòng tải lại trang.');
                return;
            }

            $btn.prop('disabled', true);
            $msg.text('');

            $.ajax({
                url: cfg.restUrl + '/warranty/request',
                method: 'POST',
                beforeSend: function (xhr) {
                    if (cfg.restNonce) {
                        xhr.setRequestHeader('X-WP-Nonce', cfg.restNonce);
                    }
                },
                data: {
                    order_id: orderId,
                    serial_number: $form.find('[name="serial_number"]').val(),
                    reason: $form.find('[name="reason"]').val()
                }
            }).done(function (res) {
                $msg.css('color', '#047857').text((res && res.message) ? res.message : 'Đã tiếp nhận yêu cầu bảo hành.');
            }).fail(function (xhr) {
                var err = (xhr.responseJSON && (xhr.responseJSON.error || xhr.responseJSON.message))
                    ? (xhr.responseJSON.error || xhr.responseJSON.message)
                    : 'Không gửi được yêu cầu.';
                $msg.css('color', '#B91C1C').text(err);
            }).always(function () {
                $btn.prop('disabled', false);
            });
        });
    });
})(jQuery);
