(function ($) {
    'use strict';

    function formatVnd(amount) {
        return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
    }

    function updateCalculator() {
        var $widget = $('#gf-installment-widget');
        if (!$widget.length) return;

        var price = parseFloat($widget.data('price')) || 20000000;
        var downPct = parseFloat($('#gf-downpayment-pct').val()) || 30;
        var months = parseInt($('#gf-term-months').val(), 10) || 6;

        $('#gf-form-down-pct').val(downPct);
        $('#gf-form-months').val(months);

        $.getJSON(gfConfig.restUrl + '/installment-calc', {
            price: price,
            down_pct: downPct,
            months: months
        }).done(function (res) {
            if (res && typeof res.monthly_amount !== 'undefined') {
                $('#gf-res-down').text(formatVnd(res.downpayment_amount));
                $('#gf-res-loan').text(formatVnd(res.loan_principal));
                $('#gf-res-monthly').text(formatVnd(res.monthly_amount) + '/th');
            }
        });
    }

    function renderTray(items) {
        var $tray = $('#gf-compare-tray');
        var $items = $('#gf-tray-items');
        if (!$tray.length) return;

        if (!items || !items.length) {
            $tray.hide();
            $items.empty();
            $('#gf-tray-count').text('0');
            return;
        }

        $('#gf-tray-count').text(items.length);
        $items.empty();
        items.forEach(function (it) {
            var $chip = $('<div class="gf-tray-chip"></div>');
            $chip.append($('<span></span>').text(it.name + ' (' + it.price + ')'));
            var $rm = $('<button type="button" title="Xóa">&times;</button>').attr('data-product-id', it.id);
            $chip.append($rm);
            $items.append($chip);
        });
        $tray.show();
    }

    function callCompare(mode, productId, reloadPage) {
        $.post(gfConfig.ajaxUrl, {
            action: 'gf_compare_action',
            nonce: gfConfig.ajaxNonce,
            mode: mode,
            product_id: productId || 0
        }).done(function (resp) {
            if (resp && resp.success) {
                renderTray(resp.data.items);
                if (reloadPage) {
                    window.location.reload();
                }
            }
        }).fail(function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message)
                ? xhr.responseJSON.data.message
                : 'Không thể cập nhật khay so sánh.';
            window.alert(msg);
        });
    }

    $(function () {
        // Calculator events
        $(document).on('change', '.gf-calc-input', updateCalculator);

        // NĐ 13/2023 Consent Banner toggle
        $(document).on('change', '#gf-consent-nd13', function () {
            $('#gf-submit-installment-btn').prop('disabled', !$(this).is(':checked'));
        });

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

            $btn.prop('disabled', true).text('Đang mã hóa AES-256 & gửi hồ sơ...');
            var fd = new FormData($form[0]);

            $.ajax({
                url: gfConfig.ajaxUrl,
                type: 'POST',
                data: fd,
                processData: false,
                contentType: false
            }).done(function (resp) {
                if (resp && resp.success) {
                    $fb.removeClass('is-error').addClass('is-success').html(
                        resp.data.message + ' <a href="' + resp.data.tracking_url + '"><strong>Theo dõi đơn hàng OMS #' + resp.data.order_id + '</strong></a>'
                    ).show();
                    $form[0].reset();
                }
            }).fail(function (xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message)
                    ? xhr.responseJSON.data.message
                    : 'Lỗi gửi hồ sơ trả góp.';
                $fb.removeClass('is-success').addClass('is-error').text(msg).show();
            }).always(function () {
                $btn.prop('disabled', !$('#gf-consent-nd13').is(':checked')).text('Nộp hồ sơ Trả góp Sinh viên (Duyệt 2 lớp)');
            });
        });

        // Compare tray controls
        if ($('#gf-compare-tray').length) {
            callCompare('list', 0, false);
        }
        $(document).on('click', '.gf-add-compare', function () {
            callCompare('add', $(this).data('product-id'), false);
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
            var orderId = $form.data('order-id');
            $.ajax({
                url: gfConfig.restUrl + '/warranty/request',
                method: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', gfConfig.restNonce);
                },
                data: {
                    order_id: orderId,
                    serial_number: $form.find('[name="serial_number"]').val(),
                    reason: $form.find('[name="reason"]').val()
                }
            }).done(function (res) {
                $('#gf-rma-msg').css('color', '#15803d').text(res.message);
            }).fail(function (xhr) {
                var err = (xhr.responseJSON && xhr.responseJSON.error) ? xhr.responseJSON.error : 'Không gửi được yêu cầu.';
                $('#gf-rma-msg').css('color', '#b91c1c').text(err);
            });
        });
    });
})(jQuery);
