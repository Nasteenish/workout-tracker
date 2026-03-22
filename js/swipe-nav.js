/* ===== Swipe Navigation ===== */
import { Builder } from './builder.js';
import { UI } from './ui.js';
import { getTotalWeeks } from './program-utils.js';

export const SwipeNav = {
    // Config-based swipe: add new routes in getConfig only
    getConfig(hash, app) {
        // Week carousel (horizontal left/right)
        if (/^#\/week\/\d+$/.test(hash)) return { mode: 'carousel' };
        // Back-swipe pages: { mode:'back', target, companion, dayNum?, onCommit? }
        if (/^#\/week\/\d+\/day\/\d+$/.test(hash))
            return { mode: 'back', target: '#/week/' + app._currentWeek, companion: 'week' };
        if (hash === '#/menu')
            return { mode: 'back', target: '#/week/' + app._currentWeek, companion: 'week' };
        if (hash === '#/settings' || hash === '#/guide' || hash === '#/calculator')
            return { mode: 'back', target: '#/menu', companion: 'menu', preCreate: true };
        var edMatch = hash.match(/^#\/edit\/day\/(\d+)$/);
        if (edMatch) {
            var dn = Builder._editingDay ? Builder._editingDay.dayNum : parseInt(edMatch[1]);
            return { mode: 'back', target: '#/week/' + app._currentWeek + '/day/' + dn, companion: 'day', dayNum: dn, onCommit: function() { Builder._editingDay = null; } };
        }
        if (/^#\/history\/.+$/.test(hash))
            return { mode: 'back', target: '#/week/' + app._currentWeek + '/day/' + app._currentDay, companion: 'day', dayNum: app._currentDay };
        // Social tab carousel (swipe between Лента ↔ Профиль)
        if (hash === '#/feed')
            return { mode: 'tabs', left: '#/week/' + app._currentWeek, right: '#/profile' };
        if (hash === '#/profile')
            return { mode: 'tabs', left: '#/feed', right: null };
        // Social back-swipe pages
        if (hash === '#/profile/edit')
            return { mode: 'back', target: '#/profile', companion: 'none' };
        if (hash === '#/checkin' || /^#\/checkin\/.+$/.test(hash))
            return { mode: 'back', target: '#/profile', companion: 'none' };
        if (hash === '#/discover')
            return { mode: 'back', target: '#/feed', companion: 'none' };
        if (hash === '#/notifications')
            return { mode: 'back', target: '#/feed', companion: 'none' };
        if (hash === '#/messages')
            return { mode: 'back', target: '#/feed', companion: 'none' };
        if (/^#\/messages\/.+$/.test(hash))
            return { mode: 'back', target: '#/messages', companion: 'none' };
        if (/^#\/u\/.+$/.test(hash))
            return { mode: 'back', target: '#/discover', companion: 'none' };
        if (/^#\/(followers|following)\/.+$/.test(hash))
            return { mode: 'back', target: '#/profile', companion: 'none' };
        // Onboarding back-swipe
        if (hash === '#/onboarding/2')
            return { mode: 'back', target: '#/onboarding/1', companion: 'none' };
        if (hash === '#/onboarding/3')
            return { mode: 'back', target: '#/onboarding/2', companion: 'none' };
        if (hash === '#/onboarding/3a')
            return { mode: 'back', target: '#/onboarding/2', companion: 'none' };
        if (hash === '#/onboarding/3t')
            return { mode: 'back', target: '#/onboarding/2', companion: 'none' };
        if (hash === '#/onboarding/4')
            return { mode: 'back', target: '#/onboarding/3a', companion: 'none' };
        if (hash === '#/onboarding/5')
            return { mode: 'back', target: '#/onboarding/4', companion: 'none' };
        return null;
    },

    init(app) {
        let startX = 0, startY = 0;
        let dragging = false, locked = false;
        let swipingLeft = false;
        let companion = null;
        let isBack = false;
        let isTabSwipe = false;
        let tabTarget = null;
        let savedScrollY = 0;
        let cfg = null;
        let originalHash = '';

        const W = () => window.innerWidth;
        const removeCompanion = () => { if (companion) { companion.remove(); companion = null; } };
        const unlockScroll = () => { document.documentElement.style.overflow = ''; document.body.style.overflow = ''; };
        const resetApp = (appEl) => {
            appEl.style.transition = 'none'; appEl.style.transform = '';
            appEl.style.position = ''; appEl.style.top = ''; appEl.style.left = ''; appEl.style.right = '';
            appEl.classList.remove('swiping-back');
        };

        const createCarouselCompanion = (targetWeek) => {
            const c = document.createElement('div');
            c.className = 'nav-companion';
            const cached = app._pageCache['#/week/' + targetWeek];
            if (cached) {
                const tmp = document.createElement('div');
                tmp.innerHTML = cached;
                const slide = tmp.querySelector('.week-slide');
                c.innerHTML = slide ? slide.innerHTML : UI._weekCardsHTML(targetWeek);
            } else {
                c.innerHTML = UI._weekCardsHTML(targetWeek);
            }
            const container = document.querySelector('.slide-container');
            if (container) container.appendChild(c);
            return c;
        };

        const createBackCompanion = (type, dayNum, targetHash) => {
            const c = document.createElement('div');
            c.className = 'back-companion';
            // Cache-first: use previously rendered HTML if available
            if (targetHash && app._pageCache[targetHash]) {
                c.innerHTML = app._pageCache[targetHash];
            }
            // Fallback: render fresh when cache is cold
            else if (type === 'week') c.innerHTML = UI._weekViewHTML(app._currentWeek);
            else if (type === 'menu') c.innerHTML = UI._menuHTML();
            else if (type === 'day') c.innerHTML = UI._dayViewHTML(app._currentWeek, dayNum || app._currentDay);
            // Offset companion content to match saved scroll position
            var savedScroll = targetHash && app._scrollCache[targetHash];
            if (savedScroll) {
                // Wrap content in a container shifted up by the scroll offset
                var inner = document.createElement('div');
                inner.style.transform = 'translateY(-' + savedScroll + 'px)';
                while (c.firstChild) inner.appendChild(c.firstChild);
                c.appendChild(inner);
            }
            document.body.appendChild(c);
            return c;
        };

        document.addEventListener('touchstart', (e) => {
            // Ignore touches during reorder mode
            if (window._reorderMode) { cfg = null; return; }
            // Ignore touches inside modal overlays (equipment, gym, etc.)
            if (e.target.closest('.modal-overlay')) { cfg = null; return; }
            cfg = SwipeNav.getConfig(location.hash, app);
            if (!cfg) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dragging = false; locked = false; isBack = false; isTabSwipe = false; tabTarget = null;
            originalHash = location.hash;
            removeCompanion();
            if (cfg.preCreate) {
                companion = createBackCompanion(cfg.companion, cfg.dayNum, cfg.target);
                if (companion) companion.style.transform = `translateX(${-W()}px)`;
            }
            if (cfg.mode === 'carousel') {
                const el = document.querySelector('.week-slide');
                if (el) el.style.transition = 'none';
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!cfg) return;
            if (locked) return;
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;

            if (!dragging) {
                if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
                if (Math.abs(dy) > Math.abs(dx)) { locked = true; return; }
                if (cfg.mode === 'back' && dx < 0) { locked = true; return; }
                if (cfg.mode === 'tabs' && dx < 0 && !cfg.right) { locked = true; return; }
                if (cfg.mode === 'tabs' && dx > 0 && !cfg.left) { locked = true; return; }
                dragging = true;
                swipingLeft = dx < 0;
                savedScrollY = window.scrollY;
                document.documentElement.style.overflow = 'hidden';
                document.body.style.overflow = 'hidden';

                if (cfg.mode === 'tabs') {
                    tabTarget = swipingLeft ? cfg.right : cfg.left;
                    isTabSwipe = true;
                } else if (cfg.mode === 'carousel') {
                    const targetWeek = swipingLeft
                        ? (app._currentWeek === getTotalWeeks() ? 1 : app._currentWeek + 1)
                        : (app._currentWeek === 1 ? getTotalWeeks() : app._currentWeek - 1);
                    companion = createCarouselCompanion(targetWeek);
                    companion.style.transition = 'none';
                    companion.style.transform = `translateX(${swipingLeft ? W() : -W()}px)`;
                } else {
                    isBack = true;
                    app._swipeLock = true;
                    if (!cfg.preCreate) {
                        companion = createBackCompanion(cfg.companion, cfg.dayNum, cfg.target);
                    }
                    if (companion) {
                        companion.style.transition = 'none';
                        companion.style.transform = `translateX(${-0.28 * W()}px)`;
                    }
                    const appEl = document.getElementById('app');
                    appEl.style.position = 'fixed';
                    var bodyPad = parseInt(getComputedStyle(document.body).paddingTop) || 0;
                    appEl.style.top = `${bodyPad - savedScrollY}px`;
                    appEl.style.left = '0'; appEl.style.right = '0';
                    appEl.classList.add('swiping-back');
                    appEl.style.transition = 'none';
                }
            }

            if (dragging) { e.preventDefault(); window.scrollTo(0, savedScrollY); }

            if (isTabSwipe) {
                // No visual drag — just track gesture
            } else if (isBack) {
                document.getElementById('app').style.transform = `translateX(${dx}px)`;
                if (companion) companion.style.transform = `translateX(${-0.28 * W() + 0.28 * dx}px)`;
            } else {
                const front = document.querySelector('.week-slide');
                if (front) front.style.transform = `translateX(${dx}px)`;
                if (companion) companion.style.transform = `translateX(${(swipingLeft ? W() : -W()) + dx}px)`;
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!cfg) return;
            if (!dragging && !isBack && !isTabSwipe) { if (companion) removeCompanion(); return; }
            const dx = e.changedTouches[0].clientX - startX;
            const snap = 'transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            const commit = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)';

            // === Tab swipe (feed ↔ profile): instant navigation ===
            if (isTabSwipe) {
                unlockScroll();
                if (!dragging || Math.abs(dx) < 60) return;
                app._isBackSwipe = true;
                location.hash = tabTarget;
                return;
            }

            // === Back-swipe ===
            if (isBack) {
                const appEl = document.getElementById('app');
                if (!dragging || dx < 60) {
                    app._swipeLock = true;
                    appEl.style.transition = snap;
                    appEl.style.transform = 'translateX(0)';
                    if (companion) { companion.style.transition = snap; companion.style.transform = `translateX(${-0.28 * W()}px)`; }
                    setTimeout(() => {
                        removeCompanion(); unlockScroll(); resetApp(appEl);
                        // iOS native back may have changed the hash during snap-back — restore it
                        if (location.hash !== originalHash) history.replaceState(null, '', originalHash);
                        app._swipeLock = false;
                        window.scrollTo(0, savedScrollY);
                    }, 230);
                    return;
                }
                app._swipeLock = true;
                appEl.style.transition = commit;
                appEl.style.transform = `translateX(${W() + 20}px)`;
                if (companion) { companion.style.transition = commit; companion.style.transform = 'translateX(0)'; }
                const target = cfg.target;
                const onCommit = cfg.onCommit;
                setTimeout(() => {
                    if (onCommit) onCommit();
                    appEl.classList.add('no-animate');
                    app._isBackSwipe = true;

                    if (location.hash !== originalHash) {
                        // iOS native back already navigated
                        if (cfg.useReplace) {
                            history.replaceState(null, '', target);
                        }
                        appEl.style.opacity = '0';
                        unlockScroll();
                        resetApp(appEl);
                        removeCompanion();
                        app.route(true);
                        appEl.style.opacity = '';
                        app._isBackSwipe = false;
                        app._swipeLock = false;
                    } else if (cfg.useReplace) {
                        // Editor: replace entry instead of history.back to avoid forward-history loop
                        history.replaceState(null, '', target);
                        appEl.style.opacity = '0';
                        app._isBackSwipe = false;
                        app._swipeLock = false;
                        unlockScroll();
                        resetApp(appEl);
                        removeCompanion();
                        app.route(true);
                        appEl.style.opacity = '';
                    } else {
                        // Pop history entry properly with history.back()
                        app._pendingSwipeCleanup = () => {
                            resetApp(appEl);
                            removeCompanion();
                        };
                        app._swipeLock = false;
                        app._backSwipeFallbackTimer = setTimeout(() => {
                            if (app._isBackSwipe) {
                                history.replaceState(null, '', target);
                                app._isBackSwipe = false;
                                appEl.style.opacity = '0';
                                unlockScroll();
                                if (app._pendingSwipeCleanup) {
                                    app._pendingSwipeCleanup();
                                    app._pendingSwipeCleanup = null;
                                }
                                app.route(true);
                                appEl.style.opacity = '';
                            }
                        }, 100);
                        history.back();
                    }
                }, 270);
                return;
            }

            // === Week carousel ===
            const front = document.querySelector('.week-slide');
            if (!dragging || Math.abs(dx) < 60) {
                if (front) { front.style.transition = snap; front.style.transform = 'translateX(0)'; }
                if (companion) {
                    companion.style.transition = snap;
                    companion.style.transform = `translateX(${swipingLeft ? W() : -W()}px)`;
                    setTimeout(() => { removeCompanion(); unlockScroll(); }, 230);
                }
                unlockScroll();
                return;
            }
            if (front) { front.style.transition = commit; front.style.transform = `translateX(${swipingLeft ? '-110%' : '110%'})`; }
            if (companion) { companion.style.transition = commit; companion.style.transform = 'translateX(0)'; }
            const next = swipingLeft
                ? (app._currentWeek === getTotalWeeks() ? 1 : app._currentWeek + 1)
                : (app._currentWeek === 1 ? getTotalWeeks() : app._currentWeek - 1);
            setTimeout(() => { unlockScroll(); app._scrollCache[`#/week/${next}`] = savedScrollY; location.hash = `#/week/${next}`; requestAnimationFrame(removeCompanion); }, 190);
        }, { passive: true });
    }
};
