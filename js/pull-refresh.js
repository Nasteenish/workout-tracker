/* ===== Pull-to-Refresh ===== */
export const PullRefresh = {
    init(onRefresh) {
        let startY = 0;
        let pulling = false;
        let ready = false;
        const threshold = 80;
        let indicator = null;

        const DUMBBELL_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="1" y="9" width="3" height="6" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="7" width="3" height="10" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="7" width="3" height="10" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="20" y="9" width="3" height="6" rx="1" stroke="currentColor" stroke-width="1.8"/><line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

        let active = false;
        let bottomActive = false;
        let pullLocked = false;
        let startX_pull = 0;
        const app = document.getElementById('app');

        const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

        const snapBack = (fromY) => {
            if (Math.abs(fromY) < 1) { app.style.transition = ''; app.style.transform = ''; return; }

            // Nudge scroll to 1px so iOS Safari doesn't engage native top-bounce
            if (fromY > 0 && window.scrollY < 1) window.scrollTo(0, 1);

            app.style.transition = 'none';
            const t0 = performance.now();
            const dur = 500;
            const tick = (now) => {
                const p = Math.min((now - t0) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const y = fromY * (1 - ease);
                if (p < 1 && Math.abs(y) > 0.3) {
                    app.style.transform = `translateY(${y.toFixed(1)}px)`;
                    requestAnimationFrame(tick);
                } else {
                    app.style.transition = '';
                    app.style.transform = '';
                }
            };
            requestAnimationFrame(tick);
        };

        document.addEventListener('touchstart', (e) => {
            // Ignore touches during slot drag-and-drop or reorder mode
            if (window._slotDragging || window._reorderMode) {
                pullLocked = true;
                return;
            }
            // Ignore touches inside modal overlays
            if (e.target.closest('.modal-overlay')) {
                pullLocked = true;
                return;
            }
            // Ignore touches on the rest timer bar
            const timerBar = document.getElementById('rest-timer-bar');
            if (timerBar && (timerBar === e.target || timerBar.contains(e.target))) {
                pullLocked = true;
                return;
            }
            startY = e.touches[0].clientY;
            startX_pull = e.touches[0].clientX;
            pulling = window.scrollY <= 2;
            pullLocked = false;
            ready = false;
            active = false;
            bottomActive = false;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (pullLocked || window._slotDragging || window._reorderMode) return;
            if (!pulling && !atBottom()) return;
            const dy = e.touches[0].clientY - startY;
            const dx = e.touches[0].clientX - startX_pull;

            // Direction lock: if horizontal, stop pull handling
            if (!active && !bottomActive && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
                pullLocked = true;
                pulling = false;
                return;
            }

            // Pull down from top
            if (pulling) {
                if (window.scrollY > 2) { pulling = false; active = false; return; }
                if (dy > 10) {
                    e.preventDefault();
                    if (!app.classList.contains('swiping-back')) {
                        if (!active) { active = true; app.style.transition = 'none'; }
                        app.style.transform = `translateY(${Math.min((dy - 10) * 0.35, 55)}px)`;
                    }
                    if (!indicator) {
                        indicator = document.createElement('div');
                        indicator.id = 'pull-indicator';
                        indicator.innerHTML = DUMBBELL_SVG;
                        document.body.appendChild(indicator);
                    }
                    if (ready) return;
                    const progress = Math.min(dy / threshold, 1);
                    indicator.style.opacity = progress;
                    indicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg)`;
                    if (progress >= 1) {
                        ready = true;
                        indicator.style.transform = '';
                        indicator.classList.add('spinning');
                    }
                }
            }

            // Pull up from bottom
            if (atBottom() && dy < -10 && !active) {
                e.preventDefault();
                if (!app.classList.contains('swiping-back')) {
                    if (!bottomActive) { bottomActive = true; app.style.transition = 'none'; }
                    app.style.transform = `translateY(${Math.max((dy + 10) * 0.35, -55)}px)`;
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            // Snap back from bottom pull
            if (bottomActive) {
                const m = app.style.transform.match(/translateY\((.+?)px\)/);
                if (m) snapBack(parseFloat(m[1]));
            }

            // Pull-to-refresh triggered: CSS snap-back then re-render
            if (indicator && ready) {
                var indRef = indicator;
                setTimeout(function() { indRef.remove(); }, 500);
                indicator = null;
                // CSS transition snap (smoother than rAF when followed by DOM update)
                app.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                app.style.transform = 'translateY(0)';
                // Re-render AFTER snap completes to avoid jank
                setTimeout(function() {
                    app.style.transition = '';
                    app.style.transform = '';
                    app.classList.add('no-animate');
                    onRefresh();
                }, 260);
                pulling = false; ready = false; active = false; bottomActive = false;
                return;
            }

            // Snap back from top pull (no refresh)
            if (active) {
                const m = app.style.transform.match(/translateY\((.+?)px\)/);
                if (m) snapBack(parseFloat(m[1]));
            }
            if (indicator) {
                const cur = indicator.style.transform || 'translateX(-50%)';
                indicator.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                indicator.style.opacity = '0';
                indicator.style.transform = cur + ' scale(0.5)';
                const ref = indicator;
                setTimeout(() => { ref.remove(); }, 310);
                indicator = null;
            }
            pulling = false;
            ready = false;
            active = false;
            bottomActive = false;
        });
    }
};
