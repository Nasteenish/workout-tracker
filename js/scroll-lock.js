/* ===== Scroll Lock Utilities ===== */

export function lockBodyScroll() {
    if (document.body.classList.contains('modal-open')) return;
    document.body.dataset.scrollY = window.scrollY;
    document.body.style.top = '-' + window.scrollY + 'px';
    document.body.classList.add('modal-open');
}

export function unlockBodyScroll() {
    if (!document.body.classList.contains('modal-open')) return;
    document.body.classList.remove('modal-open');
    var scrollY = parseInt(document.body.dataset.scrollY || '0');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
}

export function blockOverlayScroll(overlay, scrollableSelector) {
    var selectors = Array.isArray(scrollableSelector) ? scrollableSelector : [scrollableSelector];
    overlay.addEventListener('touchmove', function(e) {
        for (var i = 0; i < selectors.length; i++) {
            if (e.target.closest(selectors[i])) return;
        }
        e.preventDefault();
    }, { passive: false });
}

export function _restoreFocus(info) {
    if (!info) return;
    var sel = info.cls + '[data-exercise="' + info.ex + '"][data-set="' + info.set + '"]';
    if (info.seg != null) sel += '[data-seg="' + info.seg + '"]';
    var el = document.querySelector(sel);
    if (el) {
        el.focus({ preventScroll: true });
        if (info.pos != null) {
            try { el.setSelectionRange(info.pos, info.pos); } catch (_) {}
        }
    }
}
