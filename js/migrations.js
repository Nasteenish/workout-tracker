/* ===== Data Migrations ===== */

const Migrations = {
    /**
     * Run all pending one-time migrations.
     * Each migration is guarded by a localStorage flag so it only runs once.
     */
    run() {
        this._migrations.forEach(function(m) {
            if (!localStorage.getItem(m.key)) {
                try { m.fn(); } catch(e) { console.error('Migration error:', m.key, e); }
                localStorage.setItem(m.key, '1');
            }
        });
    },

    /**
     * Fix corrupted _gym (object instead of string) and remove empty exercise entries in log.
     * Called after sync to clean up data that cloud may have re-introduced.
     */
    cleanOrphanedLogEntries() {
        try {
            Storage._invalidateCache();
            var d = Storage._load();
            if (!d || !d.log) return;
            var changed = false;
            for (var w in d.log) {
                for (var dd in d.log[w]) {
                    var dayLog = d.log[w][dd];
                    // Fix corrupted _gym (object instead of string)
                    if (dayLog._gym && typeof dayLog._gym === 'object') {
                        var chars = [];
                        for (var ci = 0; ci < Object.keys(dayLog._gym).length; ci++) {
                            chars.push(dayLog._gym[String(ci)] || '');
                        }
                        dayLog._gym = chars.join('');
                        changed = true;
                    }
                    // Remove empty exercise entries
                    for (var exKey in dayLog) {
                        if (exKey.charAt(0) === '_') continue;
                        if (typeof dayLog[exKey] === 'object' && dayLog[exKey] !== null && Object.keys(dayLog[exKey]).length === 0) {
                            delete dayLog[exKey];
                            changed = true;
                        }
                    }
                }
            }
            if (changed) Storage._save();
        } catch (e) {
            console.error('Log cleanup error:', e);
        }
    },

    _migrations: [
        // v1: Fix exerciseChoices for Anastasia (D1_deadlift, D2_support)
        {
            key: '_fix_choices_v1',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    if (!dd.exerciseChoices) continue;
                    var changed = false;
                    if (dd.exerciseChoices.D1_deadlift === 'D1E1_opt1') {
                        dd.exerciseChoices.D1_deadlift = 'D1E1_opt3';
                        changed = true;
                    }
                    if (dd.exerciseChoices.D2_support === 'D2E1_opt4') {
                        dd.exerciseChoices.D2_support = 'D2E1';
                        changed = true;
                    }
                    if (changed) localStorage.setItem(keys[ki], JSON.stringify(dd));
                }
            }
        },
        // v2: Remove gym80 Abdominal from D2E1 (wrong binding)
        {
            key: '_fix_d2e1_eq',
            fn: function() {
                var keys = Object.keys(localStorage);
                for (var ki = 0; ki < keys.length; ki++) {
                    if (keys[ki].indexOf('wt_data_') !== 0) continue;
                    var dd = JSON.parse(localStorage.getItem(keys[ki]) || '{}');
                    if (dd.exerciseEquipment && dd.exerciseEquipment.D2E1 === 'eq_1773590540310') {
                        delete dd.exerciseEquipment.D2E1;
                        localStorage.setItem(keys[ki], JSON.stringify(dd));
                    }
                }
            }
        },
        // v3: Remove Precor Seated Leg Curl from D1E2 (test data)
        {
            key: '_fix_precor_d1e2',
            fn: function() {
                var allUsers = Storage.getUsers ? Storage.getUsers() : [];
                for (var i = 0; i < allUsers.length; i++) {
                    var key = 'wt_data_' + allUsers[i].id;
                    var d = JSON.parse(localStorage.getItem(key) || '{}');
                    if (d.exerciseEquipment && d.exerciseEquipment.D1E2) {
                        var eq = d.equipment || [];
                        var eqObj = eq.find(function(e) { return e.id === d.exerciseEquipment.D1E2; });
                        if (eqObj && eqObj.name && eqObj.name.toLowerCase().indexOf('precor') !== -1) {
                            delete d.exerciseEquipment.D1E2;
                            localStorage.setItem(key, JSON.stringify(d));
                        }
                    }
                }
            }
        },
        // v4: Fix corrupted _gym (object instead of string) + empty entries in log
        {
            key: '_fix_orphan_log_v2',
            fn: function() {
                var allUsers = Storage.getUsers ? Storage.getUsers() : [];
                for (var ui = 0; ui < allUsers.length; ui++) {
                    var key = 'wt_data_' + allUsers[ui].id;
                    var d = JSON.parse(localStorage.getItem(key) || '{}');
                    if (!d.log) continue;
                    var changed = false;
                    for (var w in d.log) {
                        for (var dd in d.log[w]) {
                            var dayLog = d.log[w][dd];
                            if (dayLog._gym && typeof dayLog._gym === 'object') {
                                var chars = [];
                                for (var ci = 0; ci < Object.keys(dayLog._gym).length; ci++) {
                                    chars.push(dayLog._gym[String(ci)] || '');
                                }
                                dayLog._gym = chars.join('');
                                changed = true;
                            }
                            for (var ek in dayLog) {
                                if (ek.charAt(0) === '_') continue;
                                if (typeof dayLog[ek] === 'object' && dayLog[ek] !== null && Object.keys(dayLog[ek]).length === 0) {
                                    delete dayLog[ek];
                                    changed = true;
                                }
                            }
                        }
                    }
                    if (changed) localStorage.setItem(key, JSON.stringify(d));
                }
            }
        }
    ]
};