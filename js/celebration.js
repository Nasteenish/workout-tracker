/* ===== Workout Complete Celebration ===== */
import { Social } from './social.js';
import { Storage } from './storage.js';
import { resolveWorkout, exName } from './program-utils.js';

export const Celebration = {
    _onShareCheckin: null,
    _colors: ['#9D8DF5', '#B5F22A', '#FF6D28', '#30D4C8', '#FF2D55', '#C3FF3C', '#4A96FF', '#fff'],
    _shapes: ['circle', 'star', 'square', 'diamond'],
    _phrases: [
        'Отличная работа!',
        'Ты — машина!',
        'Мощная тренировка!',
        'Так держать!',
        'Огонь!'
    ],

    show(elapsedSec, weekNum, dayNum) {
        if (document.querySelector('.celebration-overlay')) return;

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 150]);

        // Gym is already persisted in log via saveWorkoutGym when selected

        var phrase = this._phrases[Math.floor(Math.random() * this._phrases.length)];
        var timeText = '';
        if (elapsedSec && elapsedSec > 0) {
            var h = Math.floor(elapsedSec / 3600);
            var m = Math.floor((elapsedSec % 3600) / 60);
            if (h > 0) {
                timeText = '<p class="celeb-time">' + h + ' ч ' + m + ' мин</p>';
            } else {
                timeText = '<p class="celeb-time">' + m + ' мин</p>';
            }
        }

        // Share button (only for Supabase-authenticated users)
        var shareBtn = '';
        if (Social && Social._hasSupaAuth()) {
            shareBtn = '<button class="celeb-share-btn" id="celeb-share">ПОДЕЛИТЬСЯ</button>';
        }

        var overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        overlay.innerHTML = '<div class="celebration-text">' +
            '<div class="celeb-icon-ring"><svg width="72" height="72" viewBox="0 0 72 72"><defs><linearGradient id="cg-done" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse"><stop stop-color="#C3FF3C"/><stop offset="1" stop-color="#5AA00A"/></linearGradient></defs><circle cx="36" cy="36" r="36" fill="url(#cg-done)"/><path d="M22 36l9 9 19-19" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
            '<p class="celeb-title">' + phrase + '</p>' +
            '<p class="celeb-sub">Тренировка завершена</p>' +
            timeText +
            shareBtn +
            '</div>';
        document.body.appendChild(overlay);

        this._launchConfetti();

        // Build workout summary for sharing
        if (weekNum && dayNum && Social && Social._hasSupaAuth()) {
            var workout = resolveWorkout(weekNum, dayNum);
            var exercises = [];
            var totalSets = 0;
            // Build detailed exercise data with logged sets
            var buildExDetail = function(ex) {
                var name = exName(ex);
                var numSets = ex.sets ? ex.sets.length : 0;
                totalSets += numSets;
                var loggedSets = [];
                for (var si = 0; si < numSets; si++) {
                    var sl = Storage.getSetLog(weekNum, dayNum, ex.id, si);
                    if (sl && sl.completed) {
                        var setInfo = { weight: sl.weight || 0, reps: sl.reps || 0, unit: sl.unit || 'kg' };
                        if (sl.equipmentId) {
                            var eq = Storage.getEquipmentById(sl.equipmentId);
                            if (eq) setInfo.equipment = eq.name;
                        }
                        loggedSets.push(setInfo);
                    }
                }
                exercises.push({ name: name, sets: numSets, logged: loggedSets });
            };
            if (workout && workout.exerciseGroups) {
                workout.exerciseGroups.forEach(function(g) {
                    if (g.type === 'single' && g.exercise) {
                        buildExDetail(g.exercise);
                    } else if (g.type === 'superset' && g.exercises) {
                        g.exercises.forEach(function(item) {
                            buildExDetail(item.exercise || item);
                        });
                    } else if (g.type === 'choose_one' && g.exercises) {
                        var chosen = typeof getChosenExercise === 'function' ? getChosenExercise(g, weekNum) : g.exercises[0];
                        if (chosen) buildExDetail(chosen);
                    }
                });
            }
            var dayTitle = workout ? (workout.titleRu || workout.title || '') : '';
            // Extract primary muscle group tag from title
            var muscleGroup = '';
            var t = dayTitle.toLowerCase();
            if (t.indexOf('ягодиц') !== -1 || t.indexOf('glute') !== -1) muscleGroup = 'Ягодицы';
            if (t.indexOf('бедр') !== -1 || t.indexOf('квадри') !== -1 || t.indexOf('ног') !== -1 || t.indexOf('leg') !== -1) muscleGroup = muscleGroup ? 'Ноги' : 'Ноги';
            if ((t.indexOf('ягодиц') !== -1) && (t.indexOf('бедр') !== -1 || t.indexOf('квадри') !== -1)) muscleGroup = 'Ноги и ягодицы';
            if (t.indexOf('спин') !== -1 || t.indexOf('back') !== -1) muscleGroup = 'Спина';
            if (t.indexOf('груд') !== -1 || t.indexOf('chest') !== -1) muscleGroup = 'Грудь';
            if (t.indexOf('плеч') !== -1 || t.indexOf('дельт') !== -1 || t.indexOf('shoulder') !== -1) muscleGroup = muscleGroup || 'Плечи';
            if (t.indexOf('бицепс') !== -1 || t.indexOf('трицепс') !== -1 || t.indexOf('рук') !== -1 || t.indexOf('arm') !== -1) muscleGroup = muscleGroup || 'Руки';
            if (!muscleGroup && dayTitle) muscleGroup = dayTitle;
            var gymName = '';
            var celebGymId = Storage.getWorkoutGym(weekNum, dayNum);
            if (celebGymId) {
                var celebGym = Storage.getGymById(celebGymId);
                if (celebGym) gymName = celebGym.name;
            }
            this._pendingShare = {
                week: weekNum, day: dayNum, title: dayTitle,
                muscle_group: muscleGroup,
                exercises: exercises, total_sets: totalSets,
                duration_sec: elapsedSec || 0,
                gym_name: gymName || undefined
            };
        }

        var self = this;
        var closed = false;
        function close(e) {
            if (e && e.target && e.target.id === 'celeb-share') return;
            if (closed) return;
            closed = true;
            overlay.classList.add('hiding');
            setTimeout(function() { overlay.remove(); }, 400);
        }

        // Share button handler
        var shareBtnEl = overlay.querySelector('#celeb-share');
        if (shareBtnEl) {
            shareBtnEl.addEventListener('click', function(e) {
                e.stopPropagation();
                if (self._pendingShare) {
                    if (self._onShareCheckin) self._onShareCheckin(self._pendingShare);
                    self._pendingShare = null;
                }
                closed = true;
                overlay.classList.add('hiding');
                setTimeout(function() {
                    overlay.remove();
                    location.hash = '#/checkin';
                }, 300);
            });
        }

        overlay.addEventListener('click', close);
        setTimeout(close, 6000);
    },

    _launchConfetti() {
        var self = this;
        var total = 60;
        for (var i = 0; i < total; i++) {
            setTimeout(function() { self._createConfetti(); }, i * 40);
        }
    },

    _createConfetti() {
        var color = this._colors[Math.floor(Math.random() * this._colors.length)];
        var size = 6 + Math.random() * 6;
        var isRect = Math.random() > 0.4;

        var el = document.createElement('div');
        el.className = 'firework-particle';
        el.style.left = (5 + Math.random() * 90) + 'vw';
        el.style.top = '-20px';
        el.style.width = (isRect ? size * 0.6 : size) + 'px';
        el.style.height = (isRect ? size * 1.6 : size) + 'px';
        el.style.borderRadius = isRect ? '2px' : '50%';
        el.style.background = color;
        document.body.appendChild(el);

        var swayAmp = 40 + Math.random() * 80;
        var swayFreq = 2 + Math.random() * 3;
        var fallSpeed = 1.5 + Math.random() * 2;
        var rotSpeed = (Math.random() - 0.5) * 720;
        var duration = 2500 + Math.random() * 1500;
        var startDelay = Math.random() * 0.15;

        var start = performance.now();
        var screenH = window.innerHeight;
        function animate(now) {
            var t = Math.min((now - start) / duration, 1);
            if (t < startDelay) { requestAnimationFrame(animate); return; }
            var p = (t - startDelay) / (1 - startDelay);
            var y = p * (screenH + 40);
            var x = Math.sin(p * swayFreq * Math.PI) * swayAmp;
            var rot = rotSpeed * p;
            var opacity = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
            el.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + 'deg)';
            el.style.opacity = opacity;
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                el.remove();
            }
        }
        requestAnimationFrame(animate);
    }
};
