/* ===== Utility Functions ===== */
import { EXERCISE_DB } from './exercises_db.js';

// Escape HTML entities to prevent XSS
export function esc(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Non-intrusive error toast — debounced to max 1 per 10s
var _errorToastTimer = 0;
export function showErrorToast(msg) {
    var now = Date.now();
    if (now - _errorToastTimer < 10000) return;
    _errorToastTimer = now;
    var el = document.createElement('div');
    el.className = 'error-toast';
    el.textContent = msg || 'Ошибка сети';
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 4000);
}

// Exercise thumbnail URL from name (matches Supabase storage path)
export const EX_THUMB_BASE = 'https://mqyfdbfdeuwojgexhwpy.supabase.co/storage/v1/object/public/equipment-images/exercise-thumbs/';
var _exThumbLookup = null;
function _buildThumbLookup() {
    if (_exThumbLookup) return;
    _exThumbLookup = {};
    if (EXERCISE_DB) {
        for (var i = 0; i < EXERCISE_DB.length; i++) {
            var ex = EXERCISE_DB[i];
            if (ex.name) {
                _exThumbLookup[ex.name.toLowerCase()] = ex.name;
                if (ex.nameRu) _exThumbLookup[ex.nameRu.toLowerCase()] = ex.name;
            }
        }
    }
}
export function exThumbUrl(name, nameRu) {
    if (!name && !nameRu) return '';
    _buildThumbLookup();
    // Try resolving via EXERCISE_DB: check name first, then nameRu
    var resolved = null;
    if (_exThumbLookup) {
        if (name) resolved = _exThumbLookup[name.toLowerCase()];
        if (!resolved && nameRu) resolved = _exThumbLookup[nameRu.toLowerCase()];
    }
    var canonical = resolved || name || nameRu;
    return EX_THUMB_BASE + canonical.replace(/ /g, '_').replace(/[()\/]/g, '_') + '.jpg';
}
export function exThumbHtml(name, sizeOrNameRu, size) {
    // Supports: exThumbHtml(name), exThumbHtml(name, size), exThumbHtml(name, nameRu, size)
    var nameRu = null;
    var sz = null;
    if (typeof sizeOrNameRu === 'string') { nameRu = sizeOrNameRu; sz = size; }
    else { sz = sizeOrNameRu; }
    if (!name && !nameRu) return '';
    var cls = sz ? ' style="width:' + sz + 'px;height:' + sz + 'px"' : '';
    return '<img class="ex-thumb" src="' + exThumbUrl(name, nameRu) + '" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'"' + cls + '>';
}
// Auto-trim whitespace from equipment images (fetch→blob→canvas, bypasses CORS)
var _trimCache = {};
export function autoTrimImg(img) {
    if (!img || !img.src || img._trimmed) return;
    if (img.src.startsWith('blob:') || img.src.startsWith('data:')) return;
    img._trimmed = true;
    // Hide image while trimming to prevent visible crop flash
    img.classList.remove('loaded');
    var origSrc = img.src;
    if (_trimCache[origSrc]) {
        var cached = new Image();
        cached.onload = function() {
            cached.decode().then(function() {
                img.src = _trimCache[origSrc];
                img.classList.add('loaded');
            }).catch(function() {
                img.src = _trimCache[origSrc];
                img.classList.add('loaded');
            });
        };
        cached.src = _trimCache[origSrc];
        return;
    }
    fetch(origSrc).then(function(r) { return r.blob(); }).then(function(blob) {
        var blobUrl = URL.createObjectURL(blob);
        var tmp = new Image();
        tmp.onload = function() {
            var w = tmp.naturalWidth, h = tmp.naturalHeight;
            if (!w || !h || w < 10 || h < 10) {
                URL.revokeObjectURL(blobUrl);
                img.classList.add('loaded');
                return;
            }
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            var ctx = c.getContext('2d');
            ctx.drawImage(tmp, 0, 0);
            URL.revokeObjectURL(blobUrl);
            var data;
            try { data = ctx.getImageData(0, 0, w, h).data; } catch(e) {
                img.classList.add('loaded');
                return;
            }
            // Find bounding box of non-white pixels (threshold 240)
            var t = 240, minX = w, minY = h, maxX = 0, maxY = 0;
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    var i = (y * w + x) * 4;
                    if (data[i + 3] < 10) continue; // transparent
                    if (data[i] < t || data[i+1] < t || data[i+2] < t) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX <= minX || maxY <= minY) { img.classList.add('loaded'); return; }
            // Add 5% padding
            var cw = maxX - minX, ch = maxY - minY;
            var pad = Math.round(Math.max(cw, ch) * 0.05);
            minX = Math.max(0, minX - pad);
            minY = Math.max(0, minY - pad);
            maxX = Math.min(w - 1, maxX + pad);
            maxY = Math.min(h - 1, maxY + pad);
            var tw = maxX - minX + 1, th = maxY - minY + 1;
            // Only trim if we're removing at least 20% of area
            if (tw * th > w * h * 0.8) { img.classList.add('loaded'); return; }
            var c2 = document.createElement('canvas');
            c2.width = tw; c2.height = th;
            c2.getContext('2d').drawImage(c, minX, minY, tw, th, 0, 0, tw, th);
            c2.toBlob(function(outBlob) {
                if (!outBlob) { img.classList.add('loaded'); return; }
                var url = URL.createObjectURL(outBlob);
                _trimCache[origSrc] = url;
                // Pre-decode trimmed image offscreen before showing
                var pre = new Image();
                pre.onload = function() {
                    pre.decode().then(function() {
                        img.src = url;
                        img.classList.add('loaded');
                    }).catch(function() {
                        img.src = url;
                        img.classList.add('loaded');
                    });
                };
                pre.src = url;
            }, 'image/png');
        };
        tmp.src = blobUrl;
    }).catch(function() { img.classList.add('loaded'); });
}

// Mark already-cached images as loaded instantly (prevents flicker on re-render)
export function markCachedThumbs(root) {
    var imgs = (root || document).querySelectorAll('.ex-thumb:not(.loaded)');
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].complete && imgs[i].naturalWidth > 0) imgs[i].classList.add('loaded');
    }
}

export const MONTHS_RU = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
];

export const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function validateProgram(data) {
    if (!data || typeof data !== 'object') return 'Неверный формат JSON';
    if (!data.title || typeof data.title !== 'string') return 'Отсутствует title';
    if (!data.totalWeeks || typeof data.totalWeeks !== 'number') return 'Отсутствует totalWeeks';
    if (!data.dayTemplates || typeof data.dayTemplates !== 'object') return 'Отсутствует dayTemplates';
    const days = Object.keys(data.dayTemplates);
    if (days.length === 0) return 'dayTemplates пуст';
    for (const dayKey of days) {
        const day = data.dayTemplates[dayKey];
        if (!day.exerciseGroups || !Array.isArray(day.exerciseGroups)) {
            return `День ${dayKey}: отсутствует exerciseGroups`;
        }
    }
    if (!data.weeklyOverrides) data.weeklyOverrides = {};
    return null;
}

/** Parse "YYYY-MM-DD" as local date (avoids UTC shift bug) */
export function parseLocalDate(str) {
    if (str instanceof Date) return new Date(str.getFullYear(), str.getMonth(), str.getDate());
    var p = String(str).split('-');
    return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
}

export function formatDate(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

export function formatDateFull(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    return `${DAYS_RU[d.getDay()]}, ${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
}

export function formatDateISO(date) {
    const d = (date instanceof Date) ? date : parseLocalDate(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function debounce(fn, ms) {
    let timer, lastArgs, lastCtx;
    function debounced(...args) {
        lastArgs = args;
        lastCtx = this;
        clearTimeout(timer);
        timer = setTimeout(() => { lastArgs = null; fn.apply(lastCtx, args); }, ms);
    }
    debounced.flush = function () {
        if (lastArgs) {
            clearTimeout(timer);
            const a = lastArgs;
            lastArgs = null;
            fn.apply(lastCtx, a);
        }
    };
    return debounced;
}

/**
 * Extract base exercise name by removing equipment suffix in parentheses.
 * "Жим лёжа (со штангой)" → "Жим лёжа"
 * "Bench Press (Barbell)" → "Bench Press"
 * "Бабочка (пек-дек)" → stays as-is if only 1 exercise in group
 */
export function getExerciseBaseName(nameRu) {
    return nameRu.replace(/\s*\([^)]+\)\s*$/, '').trim();
}

/**
 * Group exercises from EXERCISE_DB by base name + category.
 * Returns array of { baseName, baseNameEn, category, exercises[] }.
 * Groups with 1 exercise are still returned (caller decides display).
 */
export function groupExercisesByBase(exercises) {
    var groups = {};
    for (var i = 0; i < exercises.length; i++) {
        var ex = exercises[i];
        var baseRu = getExerciseBaseName(ex.nameRu || '');
        var baseEn = getExerciseBaseName(ex.name || '');
        var key = (baseRu || baseEn) + '|' + ex.category;
        if (!groups[key]) {
            groups[key] = { baseName: baseRu || baseEn, baseNameEn: baseEn, category: ex.category, exercises: [] };
        }
        groups[key].exercises.push(ex);
    }
    return Object.values(groups);
}

/**
 * Get variation label — the part in parentheses, or full name if no parentheses.
 * "Жим лёжа (со штангой)" → "со штангой"
 * "Бабочка (пек-дек)" → "пек-дек"
 */
export function getVariationLabel(nameRu) {
    var m = nameRu.match(/\(([^)]+)\)\s*$/);
    return m ? m[1] : nameRu;
}

/**
 * Get all exercises from an exercise group, normalizing the data.js structure.
 * Returns an array of exercise objects (resolving _chooseOne inside supersets).
 */
export function getGroupExercises(group) {
    if (group.type === 'single' || group.type === 'warmup') {
        return group.exercise ? [group.exercise] : [];
    }
    if (group.type === 'superset') {
        const exercises = group.exercises || [];
        const result = [];
        for (const item of exercises) {
            if (item._chooseOne) {
                // Add all options so IDs can be found
                for (const opt of (item.options || [])) {
                    result.push(opt);
                }
            } else {
                result.push(item);
            }
        }
        return result;
    }
    if (group.type === 'choose_one') {
        return group.options || [];
    }
    return [];
}

/**
 * Find an exercise by ID across all groups in a template.
 */
export function findExerciseInTemplate(template, exerciseId) {
    for (const group of template.exerciseGroups) {
        const exercises = getGroupExercises(group);
        for (const ex of exercises) {
            if (ex.id === exerciseId) return ex;
        }
    }
    return null;
}

/**
 * Find an exercise by ID across ALL days in a program.
 * Builds on findExerciseInTemplate() → getGroupExercises().
 */
export function findExerciseInProgram(program, exerciseId) {
    if (!program || !program.dayTemplates) return null;
    for (var dNum in program.dayTemplates) {
        var ex = findExerciseInTemplate(program.dayTemplates[dNum], exerciseId);
        if (ex) return ex;
    }
    return null;
}

/**
 * Collect ALL exercises from a program with their day numbers.
 * Returns [{ exercise, day }]. Handles all group types via getGroupExercises().
 */
export function getAllProgramExercises(program) {
    var result = [];
    if (!program) return result;
    var templates = program.dayTemplates;
    if (templates) {
        for (var dNum in templates) {
            var groups = templates[dNum].exerciseGroups || [];
            for (var g = 0; g < groups.length; g++) {
                var exercises = getGroupExercises(groups[g]);
                for (var i = 0; i < exercises.length; i++) {
                    result.push({ exercise: exercises[i], day: parseInt(dNum) });
                }
            }
        }
    }
    // Legacy format support
    if (program.days) {
        for (var d = 0; d < program.days.length; d++) {
            var dayGroups = program.days[d].groups || [];
            for (var g2 = 0; g2 < dayGroups.length; g2++) {
                var exs = getGroupExercises(dayGroups[g2]);
                for (var i2 = 0; i2 < exs.length; i2++) {
                    result.push({ exercise: exs[i2], day: d + 1 });
                }
            }
        }
    }
    return result;
}

export function formatRest(rest) {
    if (!rest || rest === '-') return '';
    if (typeof rest === 'number') {
        if (rest >= 60) return `>${Math.floor(rest / 60)}'`;
        return `${rest}"`;
    }
    return rest;
}

// Parse and clamp weight input: comma→dot, [0, 999], 2 decimal places
export function parseWeight(value) {
    var n = parseFloat(String(value).replace(',', '.'));
    if (isNaN(n) || n <= 0) return 0;
    return Math.min(Math.round(n * 100) / 100, 999);
}

// Parse and clamp reps input: integer, [0, 999]
export function parseReps(value) {
    var n = parseInt(value);
    if (isNaN(n) || n <= 0) return 0;
    return Math.min(n, 999);
}
