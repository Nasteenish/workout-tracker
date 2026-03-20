/* ===== Equipment & Gym Management ===== */
import { AppState } from './app-state.js';
import { Social } from './social.js';
import { Storage } from './storage.js';
import { WorkoutTimer } from './workout-timer.js';
import { esc, findExerciseInProgram, autoTrimImg } from './utils.js';
import { EQ, attr } from './data-attrs.js';

function _trimEquipmentImages(container) {
    if (!container) return;
    var imgs = container.querySelectorAll('.ex-thumb');
    for (var i = 0; i < imgs.length; i++) {
        (function(img) {
            if (img.complete && img.naturalWidth > 0) {
                autoTrimImg(img);
            } else {
                img.addEventListener('load', function() { autoTrimImg(img); });
            }
        })(imgs[i]);
    }
}

export const EquipmentManager = {
    _onRenderDay: null,
    _onRenderSettings: null,
    _lastGeoPos: null,
    _sharedGymsCache: null,
    _sharedEquipmentCache: null,
    _eqSearchTimer: null,

    initGymCache() {
        if (!Social) return;
        var self = this;
        Social.getAllSharedGyms().then(function(gyms) {
            self._sharedGymsCache = gyms || [];
            Storage.setGymCache(gyms || []);
            Storage.migrateLocalGyms(Social).then(function() {
                if (location.hash === '#/settings' && this._onRenderSettings) this._onRenderSettings();
            }).catch(function(e) { console.error('Gym migration error:', e); });
        }).catch(function(e) { console.error('Gym cache load error:', e); });
    },

    showGymLinkPrompt(gymId, gymName, week, day) {
        var prompt = document.getElementById('gym-link-prompt');
        if (!prompt) {
            WorkoutTimer.start(week, day);
            if (this._onRenderDay) this._onRenderDay(week, day);
            return;
        }
        prompt.style.display = 'block';
        prompt.innerHTML = '<div class="gym-geo-card">'
            + '<span>Привязать оборудование к <b>' + gymName + '</b>?</span>'
            + '<div class="gym-geo-btns">'
            + '<button class="gym-geo-yes" id="gym-link-yes" ' + attr(EQ.GYM_ID, gymId) + '>Да</button>'
            + '<button class="gym-geo-no" id="gym-link-no" ' + attr(EQ.GYM_ID, gymId) + '>Нет</button>'
            + '</div></div>';
    },

    loadSharedGyms() {
        if (!Social) return;
        var self = this;
        Social.getAllSharedGyms().then(function(gyms) {
            self._sharedGymsCache = gyms || [];
            Storage.setGymCache(gyms || []);
            self.renderSharedGyms('');
        }).catch(function() {});
    },

    renderSharedGyms(query) {
        var resultsDiv = document.getElementById('gym-shared-results');
        if (!resultsDiv) return;
        var gyms = this._sharedGymsCache || [];
        var myGyms = Storage.getGyms();
        var myIds = {};
        for (var i = 0; i < myGyms.length; i++) myIds[myGyms[i].id] = true;
        var filtered = gyms.filter(function(g) { return !myIds[g.id]; });
        if (query) {
            var q = query.toLowerCase();
            filtered = filtered.filter(function(g) {
                return (g.name && g.name.toLowerCase().indexOf(q) !== -1) || (g.city && g.city.toLowerCase().indexOf(q) !== -1);
            });
        }
        if (!filtered.length) { resultsDiv.innerHTML = ''; return; }
        var html = '<div class="gym-shared-label">Залы из базы:</div>';
        for (var i = 0; i < filtered.length; i++) {
            html += '<div class="gym-shared-item" ' + attr(EQ.GYM_SHARED_ID, filtered[i].id) + '>'
                + '<span class="gym-shared-name">' + esc(filtered[i].name) + '</span>'
                + '<span class="gym-shared-city">' + esc(filtered[i].city || '') + '</span>'
                + '</div>';
        }
        resultsDiv.innerHTML = html;
    },

    loadEquipmentBrands(exerciseId) {
        if (!Social) return;
        var modal = document.getElementById('equipment-modal');
        if (!modal) return;
        var exName = modal._exerciseName || '';
        var exNameRu = modal._exerciseNameRu || '';
        var exType = exName ? this._getExerciseType(exName) : null;
        var isFreeWeight = this._isFreeWeightExercise(exName, exNameRu);
        modal._exerciseType = exType;
        modal._isFreeWeight = isFreeWeight;

        var activeGymId = this.getActiveGymId(AppState.currentWeek, AppState.currentDay);
        var gym = activeGymId ? Storage.getGymById(activeGymId) : null;
        var gymPromise = (gym && gym.city && exName)
            ? Social.getGymEquipmentForExercise(gym.name, gym.city, exName)
            : Promise.resolve([]);

        var brandsPromise = isFreeWeight ? Promise.resolve([]) : Social.getCatalogBrands(exType);

        Promise.all([gymPromise, brandsPromise]).then(function(results) {
            var gymItems = results[0] || [];
            var brands = results[1] || [];
            if (!document.getElementById('equipment-modal')) return;

            var gymSection = document.getElementById('eq-gym-section');
            if (gymSection && gymItems.length > 0) {
                var gymHtml = '<div class="eq-section-label">В этом зале:</div>';
                for (var i = 0; i < gymItems.length; i++) {
                    gymHtml += '<div class="eq-gym-item" ' + attr(EQ.NAME, esc(gymItems[i])) + '>'
                        + '<span class="eq-shared-name">' + esc(gymItems[i]) + '</span>'
                        + '</div>';
                }
                gymSection.innerHTML = gymHtml;
            }

            var brandsSection = document.getElementById('eq-brands-section');
            if (brandsSection) {
                if (brands.length > 0) {
                    var bHtml = '<div class="eq-section-label">Каталог:</div>';
                    var et = exType || '';
                    for (var i = 0; i < brands.length; i++) {
                        bHtml += '<div class="eq-brand-item" ' + attr(EQ.BRAND, esc(brands[i])) + ' ' + attr(EQ.EXTYPE, et) + '>'
                            + '<span class="eq-brand-name">' + esc(brands[i]) + '</span>'
                            + '<span class="eq-brand-arrow">\u203A</span>'
                            + '</div>';
                    }
                    brandsSection.innerHTML = bHtml;
                } else {
                    brandsSection.innerHTML = '';
                }
            }
        }).catch(function() {});
    },

    loadBrandEquipment(brand, exerciseType) {
        var modal = document.getElementById('equipment-modal');
        if (!modal) return;
        var exType = exerciseType || modal._exerciseType || null;

        var mainContent = document.getElementById('eq-main-content');
        var brandContent = document.getElementById('eq-brand-content');
        var addRow = document.getElementById('eq-add-row');
        var searchRow = modal.querySelector('.eq-search-row');
        if (mainContent) mainContent.style.display = 'none';
        if (brandContent) brandContent.style.display = '';
        if (addRow) addRow.style.display = 'none';
        if (searchRow) searchRow.style.display = 'none';

        var eqModal = modal.querySelector('.equipment-modal');
        if (eqModal) {
            eqModal.style.maxHeight = '90vh';
            eqModal.style.minHeight = '0';
        }
        if (brandContent) {
            brandContent.style.flex = 'none';
            brandContent.style.height = 'auto';
        }

        var brandList = document.getElementById('eq-brand-list');
        if (brandList) brandList.innerHTML = '<div class="eq-section-label">Загрузка...</div>';

        var header = modal.querySelector('.eq-modal-header h3');
        if (header) header.textContent = brand;

        Social.getCatalogByBrandAndType(brand, exType).then(function(items) {
            if (!document.getElementById('equipment-modal')) return;
            var div = document.getElementById('eq-brand-list');
            if (!div) return;
            if (!items || !items.length) {
                div.innerHTML = '<div class="eq-section-label">Нет тренажёров для этого упражнения</div>';
                return;
            }
            var html = '';
            for (var i = 0; i < items.length; i++) {
                var c = items[i];
                var fullName = brand + ' ' + c.name;
                var eqImgHtml = c.image_url ? '<img class="ex-thumb" src="' + esc(c.image_url) + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '';
                html += '<div class="eq-catalog-item" ' + attr(EQ.NAME, esc(fullName)) + ' ' + attr(EQ.CATALOG_ID, c.id) + (c.image_url ? ' ' + attr(EQ.IMAGE, esc(c.image_url)) : '') + '>'
                    + eqImgHtml
                    + '<span class="eq-shared-name">' + esc(c.name) + '</span>'
                    + (c.model ? '<span class="eq-catalog-model">' + esc(c.model) + '</span>' : '')
                    + '</div>';
            }
            div.innerHTML = html;
            _trimEquipmentImages(div);
        }).catch(function() {
            var div = document.getElementById('eq-brand-list');
            if (div) div.innerHTML = '<div class="eq-section-label">Ошибка загрузки</div>';
        });
    },

    backToBrands() {
        var modal = document.getElementById('equipment-modal');
        if (!modal) return;
        var mainContent = document.getElementById('eq-main-content');
        var brandContent = document.getElementById('eq-brand-content');
        var addRow = document.getElementById('eq-add-row');
        var searchRow = modal.querySelector('.eq-search-row');
        if (mainContent) mainContent.style.display = '';
        if (brandContent) brandContent.style.display = 'none';
        if (addRow) addRow.style.display = '';
        if (searchRow) searchRow.style.display = '';
        var eqModal = modal.querySelector('.equipment-modal');
        if (eqModal) {
            eqModal.style.maxHeight = '';
            eqModal.style.minHeight = '';
        }
        if (brandContent) {
            brandContent.style.flex = '';
            brandContent.style.height = '';
        }
        var header = modal.querySelector('.eq-modal-header h3');
        if (header) header.textContent = 'Оборудование';
    },

    // Exercise name → equipment exercise_type in catalog
    _exerciseTypeMap: {
        // Chest
        'chest press': 'chest_press', 'iso-lateral chest press': 'chest_press',
        'incline chest press': 'incline_press',
        'decline bench press': 'decline_press',
        'bench press': 'bench', 'incline bench press': 'incline_press',
        'floor press': 'bench', 'hex press': 'bench',
        'chest fly': 'chest_fly', 'butterfly': 'chest_fly', 'chest dip': 'chest_dip',
        'cable crossover': 'chest_fly', 'single arm cable crossover': 'chest_fly',
        'cable fly crossovers': 'chest_fly', 'low cable fly crossovers': 'chest_fly',
        'pullover': 'pullover',
        // Back
        'lat pulldown': 'lat_pulldown', 'pull up': 'lat_pulldown', 'chin up': 'lat_pulldown',
        'vertical traction': 'lat_pulldown', 'straight arm pulldown': 'lat_pulldown',
        'seated row': 'seated_row', 'seated cable row': 'seated_row',
        'iso-lateral row': 'seated_row', 'iso-lateral high row': 'seated_row',
        'iso-lateral low row': 'seated_row', 'low row': 'seated_row',
        'cable row': 'seated_row', 'single arm cable row': 'seated_row',
        'bent over row': 'seated_row', 't bar row': 'seated_row',
        'supported bar rows': 'seated_row', 'chest supported incline row': 'seated_row',
        'back extension': 'back_extension', 'hyperextension': 'back_extension', 'glute ham raise': 'back_extension',
        'deadlift': 'deadlift', 'romanian deadlift': 'deadlift', 'straight leg deadlift': 'deadlift',
        // Legs
        'leg press': 'leg_press', 'leg press horizontal': 'leg_press', 'single leg press': 'leg_press',
        'leg extension': 'leg_extension', 'single leg extensions': 'leg_extension',
        'leg curl': 'leg_curl', 'lying leg curl': 'lying_leg_curl', 'seated leg curl': 'seated_leg_curl',
        'nordic hamstrings curls': 'lying_leg_curl',
        'hip abduction': 'hip_abduction', 'abduction': 'hip_abduction',
        'hip adduction': 'hip_adduction', 'adduction': 'hip_adduction',
        'glute kickback': 'glute_kickback', 'rear kick': 'glute_kickback', 'gluteus kick': 'glute_kickback',
        'hip thrust': 'hip_thrust', 'glute bridge': 'hip_thrust',
        'hack squat': 'squat', 'squat': 'squat', 'belt squat': 'squat',
        'pendulum squat': 'squat', 'bulgarian split squat': 'squat',
        'calf raise': 'calf', 'calf extension': 'calf', 'calf press': 'calf',
        'standing calf raise': 'calf', 'seated calf raise': 'calf',
        'tibial raises': 'calf', 'tibial raise': 'calf', 'donkey calf': 'calf',
        'medium gluteus on low pulley': 'hip_abduction', 'cable hip abduction': 'hip_abduction',
        // Shoulders
        'shoulder press': 'shoulder_press', 'overhead press': 'shoulder_press',
        'lateral raise': 'lateral_raise',
        'rear delt': 'rear_delt', 'rear delt reverse fly': 'rear_delt', 'face pull': 'rear_delt', 'reverse fly': 'rear_delt',
        'front raise': 'cable_multi', 'upright row': 'cable_multi', 'shrug': 'cable_multi',
        'unilateral low pulley raises': 'lateral_raise',
        'viking press': 'shoulder_press', 'neck press': 'shoulder_press',
        // Arms
        'bicep curl': 'bicep_curl', 'hammer curl': 'bicep_curl', 'concentration curl': 'bicep_curl',
        'behind the back curl': 'bicep_curl', 'single arm curl': 'bicep_curl',
        'overhead curl': 'bicep_curl', 'rope cable curl': 'bicep_curl', 'reverse curl': 'bicep_curl',
        'preacher curl': 'preacher_curl', 'scott curl': 'preacher_curl',
        'triceps extension': 'tricep_extension', 'triceps pushdown': 'tricep_extension',
        'triceps pressdown': 'tricep_extension', 'triceps kickback': 'tricep_extension',
        'triceps rope pushdown': 'tricep_extension',
        'skull crusher': 'tricep_extension',
        'triceps dip': 'tricep_dip', 'seated dip machine': 'chest_dip',
        // Core
        'crunch': 'crunch', 'sit up': 'crunch',
        'torso rotation': 'torso_rotation', 'cable twist': 'torso_rotation',
        'cable core palloff press': 'cable_multi', 'cable pull through': 'cable_multi',
        'ab swing': 'crunch',
        'hanging knee raise': 'crunch', 'leg raise': 'crunch',
    },

    _getEquipmentModifier(exerciseName) {
        var m = exerciseName.match(/\(([^)]+)\)/);
        if (!m) return null;
        return m[1].toLowerCase().trim();
    },

    _isFreeWeightExercise(exerciseEnName, exerciseRuName) {
        var mod = this._getEquipmentModifier(exerciseEnName || '');
        if (mod) {
            var freeTypes = ['barbell', 'dumbbell', 'bodyweight', 'band', 'resistance band', 'kettlebell', 'plate', 'ez bar', 'trap bar'];
            for (var i = 0; i < freeTypes.length; i++) {
                if (mod === freeTypes[i]) return true;
            }
        }
        var modRu = this._getEquipmentModifier(exerciseRuName || '');
        if (modRu) {
            var freeRu = ['со штангой', 'с гантелями', 'с гантелью', 'с гирей', 'с резиной', 'с диском', 'с собственным весом', 'штанга', 'гантели'];
            for (var i = 0; i < freeRu.length; i++) {
                if (modRu === freeRu[i]) return true;
            }
        }
        return false;
    },

    _getExerciseType(exerciseName) {
        var nameLower = exerciseName.toLowerCase();
        if (nameLower.indexOf('(smith machine)') !== -1) return 'smith_machine';
        var core = exerciseName.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        if (this._exerciseTypeMap[core]) return this._exerciseTypeMap[core];
        var mods = ['iso-lateral ', 'single leg ', 'single arm ', 'one arm ', 'standing ', 'seated ', 'lying ', 'prone ', 'kneeling ', 'close grip ', 'wide grip ', 'feet up '];
        var stripped = core;
        for (var i = 0; i < mods.length; i++) stripped = stripped.replace(mods[i], '');
        stripped = stripped.replace(/\s+/g, ' ').trim();
        if (this._exerciseTypeMap[stripped]) return this._exerciseTypeMap[stripped];
        for (var key in this._exerciseTypeMap) {
            if (core.indexOf(key) !== -1) return this._exerciseTypeMap[key];
        }
        return null;
    },

    searchEquipment(query) {
        var resultsDiv = document.getElementById('eq-search-results');
        if (!resultsDiv) return;
        var browseAll = !query || query.length < 2;
        if (browseAll) {
            resultsDiv.innerHTML = '<div class="eq-search-empty">Загрузка...</div>';
            clearTimeout(this._eqSearchTimer);
            if (!Social) return;
            this._eqSearchTimer = setTimeout(function() {
                Social.getCatalogByGroup(null).then(function(catalog) {
                    var div = document.getElementById('eq-search-results');
                    if (!div) return;
                    var input = document.getElementById('eq-search');
                    if (input && input.value.trim().length >= 2) return;
                    var html = '';
                    var seen = {};
                    for (var i = 0; i < catalog.length; i++) {
                        var c = catalog[i];
                        var cName = (c.brand ? c.brand + ' ' : '') + c.name;
                        var k = cName.toLowerCase();
                        if (seen[k]) continue;
                        seen[k] = true;
                        var sImgHtml = c.image_url ? '<img class="ex-thumb" src="' + esc(c.image_url) + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '';
                        html += '<div class="eq-search-item" ' + attr(EQ.NAME, esc(cName)) + ' ' + attr(EQ.CATALOG_ID, c.id) + (c.image_url ? ' ' + attr(EQ.IMAGE, esc(c.image_url)) : '') + '>'
                            + sImgHtml
                            + '<span class="eq-shared-name">' + esc(cName) + '</span>'
                            + (c.model ? '<span class="eq-catalog-model">' + esc(c.model) + '</span>' : '')
                            + '</div>';
                    }
                    if (!html) html = '<div class="eq-search-empty">Каталог пуст</div>';
                    div.innerHTML = html;
                    _trimEquipmentImages(div);
                }).catch(function() {});
            }, 100);
            return;
        }
        var ql = query.toLowerCase();

        var html = '';
        var seen = {};
        var myEq = Storage.getEquipmentList();
        for (var i = 0; i < myEq.length; i++) {
            if (myEq[i].name.toLowerCase().indexOf(ql) !== -1) {
                var k = myEq[i].name.toLowerCase().trim();
                if (seen[k]) continue;
                seen[k] = true;
                html += '<div class="eq-search-item" ' + attr(EQ.NAME, esc(myEq[i].name)) + '>'
                    + '<span class="eq-shared-name">' + esc(myEq[i].name) + '</span></div>';
            }
        }
        resultsDiv.innerHTML = html || '<div class="eq-search-empty">Поиск...</div>';

        clearTimeout(this._eqSearchTimer);
        var modal = document.getElementById('equipment-modal');
        var muscleGroup = modal ? modal._muscleGroup : 'all';

        var isFreeWeight = modal ? modal._isFreeWeight : false;
        this._eqSearchTimer = setTimeout(function() {
            if (!Social) return;
            var promises = [
                Social.searchCatalog(query, null),
                Social.searchSharedEquipment(query, null)
            ];
            Promise.all(promises).then(function(results) {
                var catalog = results[0] || [];
                var shared = results[1] || [];
                var input = document.getElementById('eq-search');
                if (!input || input.value.trim() !== query) return;
                var div = document.getElementById('eq-search-results');
                if (!div) return;

                var html2 = '';
                var seen2 = {};
                for (var i = 0; i < myEq.length; i++) {
                    if (myEq[i].name.toLowerCase().indexOf(ql) !== -1) {
                        var lk = myEq[i].name.toLowerCase().trim();
                        if (seen2[lk]) continue;
                        seen2[lk] = true;
                        html2 += '<div class="eq-search-item" ' + attr(EQ.NAME, esc(myEq[i].name)) + '>'
                            + '<span class="eq-shared-name">' + esc(myEq[i].name) + '</span></div>';
                    }
                }
                for (var i = 0; i < catalog.length; i++) {
                    var c = catalog[i];
                    var cName = (c.brand ? c.brand + ' ' : '') + c.name;
                    var k = cName.toLowerCase();
                    if (seen2[k]) continue;
                    seen2[k] = true;
                    var sImgHtml = c.image_url ? '<img class="ex-thumb" src="' + esc(c.image_url) + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.style.display=\'none\'">' : '';
                    html2 += '<div class="eq-search-item" ' + attr(EQ.NAME, esc(cName)) + ' ' + attr(EQ.CATALOG_ID, c.id) + (c.image_url ? ' ' + attr(EQ.IMAGE, esc(c.image_url)) : '') + '>'
                        + sImgHtml
                        + '<span class="eq-shared-name">' + esc(cName) + '</span>'
                        + (c.model ? '<span class="eq-catalog-model">' + esc(c.model) + '</span>' : '')
                        + '</div>';
                }
                for (var i = 0; i < shared.length; i++) {
                    var k = shared[i].name.toLowerCase();
                    if (seen2[k]) continue;
                    seen2[k] = true;
                    html2 += '<div class="eq-search-item" ' + attr(EQ.NAME, esc(shared[i].name)) + '>'
                        + '<span class="eq-shared-name">' + esc(shared[i].name) + '</span></div>';
                }
                if (!html2) html2 = '<div class="eq-search-empty">Ничего не найдено</div>';
                div.innerHTML = html2;
                _trimEquipmentImages(div);
            }).catch(function() {});
        }, 300);
    },

    shareToGymEquipment(exerciseId, equipment, week, day) {
        if (!Social || !equipment || !equipment.name) return;
        var activeGymId = this.getActiveGymId(week, day);
        if (!activeGymId) return;
        var gym = Storage.getGymById(activeGymId);
        if (!gym || !gym.city) return;
        var exerciseName = '';
        var modal = document.getElementById('equipment-modal');
        if (modal && modal._exerciseName) {
            exerciseName = modal._exerciseName;
        } else {
            var exInfo = findExerciseInProgram(Storage.getProgram(), exerciseId);
            if (exInfo) exerciseName = exInfo.name || exInfo.nameEn || '';
        }
        if (!exerciseName) return;
        Social.addGymEquipment(gym.name, gym.city, exerciseName, equipment.name, equipment.catalogId || null).catch(function() {});
    },

    suggestNearbyGym() {
        if (!navigator.geolocation) return;
        var gyms = Storage.getGyms().filter(function(g) { return g.lat && g.lng; });
        if (!gyms.length) return;

        var self = this;
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                self._lastGeoPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                var nearest = null, minDist = Infinity;
                for (var i = 0; i < gyms.length; i++) {
                    var d = self._haversineDistance(pos.coords.latitude, pos.coords.longitude, gyms[i].lat, gyms[i].lng);
                    if (d < minDist) { minDist = d; nearest = gyms[i]; }
                }
                if (nearest && minDist < 500) {
                    var suggestion = document.getElementById('gym-geo-suggestion');
                    if (suggestion) {
                        suggestion.style.display = 'block';
                        suggestion.innerHTML = '<div class="gym-geo-card">'
                            + '<span>Ты в <b>' + nearest.name + '</b>?</span>'
                            + '<div class="gym-geo-btns">'
                            + '<button class="gym-geo-yes" id="gym-geo-yes" ' + attr(EQ.GYM_ID, nearest.id) + '>Да</button>'
                            + '<button class="gym-geo-no" id="gym-geo-no">Нет</button>'
                            + '</div></div>';
                    }
                }
            },
            function() {},
            { timeout: 5000, maximumAge: 60000 }
        );
    },

    _haversineDistance(lat1, lon1, lat2, lon2) {
        var R = 6371000;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    },

    getActiveGymId(week, day) {
        if (!week || !day) return null;
        return Storage.getWorkoutGym(week, day) || null;
    }
};
