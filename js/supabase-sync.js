// supabase-sync.js — Supabase Auth + Cloud Sync
import { Storage } from './storage.js';
import { Migrations } from './migrations.js';
// AppState removed — sync should not depend on UI state

export const SUPABASE_URL = 'https://mqyfdbfdeuwojgexhwpy.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE1OTYsImV4cCI6MjA4NzQ0NzU5Nn0.5okpQM-UffmYatsVjbzjafsHhY3taCqhDYkiyEjiSvg';

// Initialize Supabase client (global `supabase` from CDN)
export const supa = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Normalize merged data: flatten any remaining choose_one groups into single exercises.
// This handles the case where cloud data came from a device that hasn't run migration v10.
function _flattenChooseOneInData(data) {
    if (!data || !data.program) return;

    function findBestChoice(choiceKey, choices) {
        if (!choices || !choiceKey) return null;
        var best = null, bestWeek = -1;
        for (var ck in choices) {
            var colonIdx = ck.indexOf(':');
            var key = colonIdx !== -1 ? ck.substring(colonIdx + 1) : ck;
            if (key !== choiceKey) continue;
            var w = colonIdx !== -1 ? parseInt(ck) : 0;
            if (w > bestWeek) { bestWeek = w; best = choices[ck]; }
        }
        return best;
    }

    function flattenGroups(groups, choices) {
        if (!groups) return null;
        var result = [], changed = false;
        for (var gi = 0; gi < groups.length; gi++) {
            var g = groups[gi];
            if (g.type === 'choose_one' && g.options && g.options.length > 0) {
                var bestId = findBestChoice(g.choiceKey, choices);
                var chosen = bestId
                    ? g.options.find(function(o) { return o.id === bestId; })
                    : null;
                if (!chosen) chosen = g.options[0];
                var ng = { type: 'single', exercise: chosen };
                if (g.sectionTitle) ng.sectionTitle = g.sectionTitle;
                if (g.sectionTitleRu) ng.sectionTitleRu = g.sectionTitleRu;
                result.push(ng);
                changed = true;
            } else {
                result.push(g);
            }
        }
        return changed ? result : null;
    }

    var dt = data.program.dayTemplates;
    if (dt) {
        for (var dayNum in dt) {
            var ng = flattenGroups(dt[dayNum].exerciseGroups, data.exerciseChoices);
            if (ng) dt[dayNum].exerciseGroups = ng;
        }
    }
    // templateSnapshots flatten removed — snapshots now live in log._template
}

export const SupaSync = {
    _saveTimer: null,
    _syncing: false,
    _onSyncWarning: null,

    // ===== AUTH =====

    async signUp(email, password, login) {
        if (!supa) throw new Error('Supabase не загружен');
        var result = await supa.auth.signUp({
            email: email,
            password: password,
            options: { data: { login: login } }
        });
        if (result.error) throw new Error(result.error.message);
        return result.data;
    },

    async signIn(email, password) {
        if (!supa) throw new Error('Supabase не загружен');
        var result = await supa.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (result.error) throw new Error(result.error.message);
        return result.data;
    },

    async signOut() {
        if (!supa) return;
        await supa.auth.signOut();
    },

    async getUser() {
        if (!supa) return null;
        var result = await supa.auth.getUser();
        return result.data ? result.data.user : null;
    },

    async getSession() {
        if (!supa) return null;
        var result = await supa.auth.getSession();
        return result.data ? result.data.session : null;
    },

    // ===== DATA SYNC =====

    // Pull user data from Supabase
    async pullData(userId) {
        if (!supa) return null;
        var result = await supa.from('user_data').select('data, updated_at').eq('user_id', userId).single();
        if (result.error) {
            if (result.error.code === 'PGRST116') return null; // No row yet
            console.error('Supabase pull error:', result.error.message);
            return null;
        }
        return result.data;
    },

    // Push user data to Supabase
    async pushData(userId, dataBlob, login) {
        if (!supa) return false;
        var result = await supa.from('user_data').upsert({
            user_id: userId,
            login: login || '',
            data: dataBlob,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        if (result.error) {
            // Try refreshing session once before giving up
            if (!this._retrying) {
                this._retrying = true;
                try {
                    var refresh = await supa.auth.refreshSession();
                    if (refresh.data && refresh.data.session) {
                        // Session refreshed — retry the push
                        var retry = await supa.from('user_data').upsert({
                            user_id: userId,
                            login: login || '',
                            data: dataBlob,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' });
                        this._retrying = false;
                        if (!retry.error) {
                            this._pushFailCount = 0;
                            return true;
                        }
                    }
                } catch (e) {
                    console.error('Session refresh failed:', e);
                }
                this._retrying = false;
            }
            console.error('Supabase push error:', result.error.message);
            this._pushFailCount = (this._pushFailCount || 0) + 1;
            // Show warning after 2 consecutive failures
            if (this._pushFailCount >= 2 && this._onSyncWarning) {
                this._onSyncWarning('Данные не синхронизируются. Нажмите, чтобы войти заново.');
            }
            return false;
        }
        this._pushFailCount = 0;
        return true;
    },

    // Deep merge workout logs: keep the entry with the latest timestamp per set
    _deepMergeLogs(localLog, remoteLog) {
        var merged = {};
        var allWeeks = new Set(Object.keys(localLog || {}).concat(Object.keys(remoteLog || {})));
        allWeeks.forEach(function(week) {
            merged[week] = {};
            var lw = (localLog || {})[week] || {};
            var rw = (remoteLog || {})[week] || {};
            var allDays = new Set(Object.keys(lw).concat(Object.keys(rw)));
            allDays.forEach(function(day) {
                merged[week][day] = {};
                var ld = lw[day] || {};
                var rd = rw[day] || {};
                // Preserve metadata fields (e.g. _gym) — don't merge them as exercises
                var allEx = new Set(Object.keys(ld).concat(Object.keys(rd)));
                allEx.forEach(function(ex) {
                    if (ex.charAt(0) === '_') {
                        // Metadata field — keep the one from whichever side has it (prefer local)
                        merged[week][day][ex] = ld[ex] !== undefined ? ld[ex] : rd[ex];
                        return;
                    }
                    merged[week][day][ex] = {};
                    var le = ld[ex] || {};
                    var re = rd[ex] || {};
                    // Skip if value is not an object (corrupted data from previous bug)
                    if (typeof le !== 'object' || le === null) le = {};
                    if (typeof re !== 'object' || re === null) re = {};
                    var allSets = new Set(Object.keys(le).concat(Object.keys(re)));
                    allSets.forEach(function(s) {
                        var ls = le[s], rs = re[s];
                        if (!ls) { merged[week][day][ex][s] = rs; }
                        else if (!rs) { merged[week][day][ex][s] = ls; }
                        else {
                            // Keep the one with latest timestamp
                            merged[week][day][ex][s] = (rs.timestamp || 0) > (ls.timestamp || 0) ? rs : ls;
                        }
                    });
                });
            });
        });
        return merged;
    },

    // Sync on login: deep merge local ↔ cloud logs
    async syncOnLogin(supaUserId, localStorageKey) {
        if (!supa || this._syncing) return;
        this._syncing = true;
        // Safety net: if sync hangs (e.g. TCP timeout), reset flag after 15s
        var syncTimeout = setTimeout(function() {
            SupaSync._syncing = false;
            console.warn('Sync timeout — _syncing flag reset');
        }, 15000);
        try {
            var remote = await this.pullData(supaUserId);
            var localRaw = localStorage.getItem(localStorageKey);
            var localData = localRaw ? JSON.parse(localRaw) : null;

            if (!remote && localData) {
                // First sync: push local to cloud
                await this.pushData(supaUserId, localData, '');
            } else if (remote && !localData) {
                // New device: pull from cloud
                localStorage.setItem(localStorageKey, JSON.stringify(remote.data));
                if (Storage && Storage._data) {
                    Storage._data = null;
                }
            } else if (remote && localData) {
                // Deep merge logs from both sides
                var remoteData = remote.data;
                var mergedLog = this._deepMergeLogs(localData.log, remoteData.log);
                // Use the newer version for non-log fields.
                // Compare client-side _lastModified timestamps (both set by the same
                // client code) to avoid false "remote wins" due to server clock drift.
                var remoteTime = remoteData._lastModified || new Date(remote.updated_at).getTime();
                var localTime = localData._lastModified || 0;
                var base = remoteTime > localTime ? remoteData : localData;
                var other = base === remoteData ? localData : remoteData;
                base.log = mergedLog;
                // If program was modified independently, use the newer program.
                var progTimeRemote = remoteData._programModified || remoteTime;
                var progTimeLocal = localData._programModified || localTime;
                var _isWorkoutActive = this._isWorkoutActiveFn && this._isWorkoutActiveFn();
                if (!_isWorkoutActive && progTimeRemote !== progTimeLocal) {
                    var progSource = progTimeRemote > progTimeLocal ? remoteData : localData;
                    if (progSource !== base && progSource.program) {
                        base.program = JSON.parse(JSON.stringify(progSource.program));
                        base._programModified = Math.max(progTimeRemote, progTimeLocal);
                    }
                }
                // Merge exerciseChoices — keep all from both sides (prevents choice loss on sync)
                if (other.exerciseChoices) {
                    if (!base.exerciseChoices) base.exerciseChoices = {};
                    for (var ck in other.exerciseChoices) {
                        if (!(ck in base.exerciseChoices)) {
                            base.exerciseChoices[ck] = other.exerciseChoices[ck];
                        }
                    }
                }
                // Merge exerciseEquipment — respect tombstones (null = explicitly removed).
                if (other.exerciseEquipment || base.exerciseEquipment) {
                    if (!base.exerciseEquipment) base.exerciseEquipment = {};
                    if (other.exerciseEquipment) {
                        for (var ek in other.exerciseEquipment) {
                            var otherVal = other.exerciseEquipment[ek];
                            var baseVal = base.exerciseEquipment[ek];
                            if (otherVal === null && baseVal === undefined) {
                                // Tombstone propagates — other side deleted, base has no opinion
                                base.exerciseEquipment[ek] = null;
                            } else if (otherVal && baseVal === undefined) {
                                // Other has a real value and base has no entry — take other's
                                base.exerciseEquipment[ek] = otherVal;
                            }
                            // If base already has a value (or tombstone) — don't overwrite
                        }
                    }
                }
                // Merge exerciseEquipmentOptions — union merge, keep all options from both sides
                if (other.exerciseEquipmentOptions || base.exerciseEquipmentOptions) {
                    if (!base.exerciseEquipmentOptions) base.exerciseEquipmentOptions = {};
                    if (other.exerciseEquipmentOptions) {
                        for (var ek2 in other.exerciseEquipmentOptions) {
                            if (!base.exerciseEquipmentOptions[ek2]) {
                                base.exerciseEquipmentOptions[ek2] = other.exerciseEquipmentOptions[ek2];
                            } else {
                                // Merge option arrays — add any from other that base doesn't have
                                var baseOpts = base.exerciseEquipmentOptions[ek2];
                                var otherOpts = other.exerciseEquipmentOptions[ek2];
                                var seen = {};
                                for (var oi = 0; oi < baseOpts.length; oi++) seen[baseOpts[oi]] = true;
                                for (var oi2 = 0; oi2 < otherOpts.length; oi2++) {
                                    if (!seen[otherOpts[oi2]]) baseOpts.push(otherOpts[oi2]);
                                }
                            }
                        }
                    }
                }
                // Merge exerciseSubstitutions — union merge (prevents substitution loss on sync)
                if (other.exerciseSubstitutions || base.exerciseSubstitutions) {
                    if (!base.exerciseSubstitutions) base.exerciseSubstitutions = {};
                    if (other.exerciseSubstitutions) {
                        for (var sk in other.exerciseSubstitutions) {
                            if (!(sk in base.exerciseSubstitutions)) {
                                base.exerciseSubstitutions[sk] = other.exerciseSubstitutions[sk];
                            }
                        }
                    }
                }
                // Merge unilateralMode — union merge, true wins over false/missing
                if (other.unilateralMode || base.unilateralMode) {
                    if (!base.unilateralMode) base.unilateralMode = {};
                    if (other.unilateralMode) {
                        for (var uk in other.unilateralMode) {
                            if (!(uk in base.unilateralMode)) {
                                base.unilateralMode[uk] = other.unilateralMode[uk];
                            }
                        }
                    }
                }
                // Merge equipment array — union by id, prefer entries with imageUrl
                if (other.equipment || base.equipment) {
                    var baseEq = base.equipment || [];
                    var otherEq = other.equipment || [];
                    var eqById = {};
                    for (var bi = 0; bi < baseEq.length; bi++) eqById[baseEq[bi].id] = baseEq[bi];
                    for (var oi3 = 0; oi3 < otherEq.length; oi3++) {
                        var oe = otherEq[oi3];
                        if (!eqById[oe.id]) {
                            eqById[oe.id] = oe;
                        } else if (oe.imageUrl && !eqById[oe.id].imageUrl) {
                            // Other has imageUrl, base doesn't — take other's
                            eqById[oe.id] = oe;
                        }
                    }
                    base.equipment = Object.values(eqById);
                }
                // templateSnapshots/weekTemplateVersion removed — snapshots now live in log._template
                // migrateExerciseNames removed from sync — runs in Storage._load() instead
                // Flatten any choose_one groups that came from a pre-v10 device
                _flattenChooseOneInData(base);
                // Clean up orphaned exerciseEquipment bindings (point to deleted equipment)
                if (base.exerciseEquipment && base.equipment) {
                    var validEqIds = {};
                    for (var vi = 0; vi < base.equipment.length; vi++) validEqIds[base.equipment[vi].id] = true;
                    for (var ek3 in base.exerciseEquipment) {
                        if (base.exerciseEquipment[ek3] && !validEqIds[base.exerciseEquipment[ek3]]) {
                            delete base.exerciseEquipment[ek3];
                        }
                    }
                }
                // Preserve the max of local/remote timestamps instead of Date.now()
                // to avoid inflating cloud _lastModified on every sync
                base._lastModified = Math.max(localTime, remoteTime);
                // Normalize equipment IDs: convert any eq_TIMESTAMP back to stable IDs
                // This fixes data that sync brought back from cloud with old format
                this._normalizeEquipmentIds(base);
                // Save merged result locally and push to cloud
                localStorage.setItem(localStorageKey, JSON.stringify(base));
                // Invalidate in-memory cache so UI reads fresh data
                if (Storage && Storage._data) {
                    Storage._data = null;
                }
                await this.pushData(supaUserId, base, '');
            }
        } catch (e) {
            console.error('Sync error:', e);
        } finally {
            clearTimeout(syncTimeout);
            this._syncing = false;
        }
    },

    // Debounced save to Supabase (call after every localStorage write)
    schedulePush(supaUserId, localStorageKey) {
        if (!supa || !supaUserId) return;
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(function() {
            var raw = localStorage.getItem(localStorageKey);
            if (!raw) return;
            try {
                var data = JSON.parse(raw);
                SupaSync.pushData(supaUserId, data, '').catch(function(e) {
                    console.error('Auto-push failed:', e);
                });
            } catch (e) {}
        }, 3000); // 3 seconds after last change
    },

    // Get the current Supabase user ID (if logged in via Supabase)
    _currentSupaUserId: null,
    _currentStorageKey: null,
    _onSyncComplete: null,  // wired in App.init() → updates UI + _lastVisSync
    _isWorkoutActiveFn: null,  // wired in App.init() → checks if workout is in progress

    // Normalize equipment IDs: convert eq_TIMESTAMP → catalog:{N} / custom:{slug}
    // Runs after every sync merge to fix old-format IDs that cloud may reintroduce
    _normalizeEquipmentIds(data) {
        if (!data || !data.equipment) return;
        var eqs = data.equipment;
        var remap = {};
        var seen = {};
        var cleaned = [];
        for (var i = 0; i < eqs.length; i++) {
            var eq = eqs[i];
            var stableId;
            if (eq.catalogId) {
                stableId = 'catalog:' + eq.catalogId;
            } else {
                stableId = 'custom:' + (eq.name || 'unknown').toLowerCase()
                    .replace(/[^a-zа-яё0-9]/gi, '_').replace(/_+/g, '_').slice(0, 40);
            }
            if (seen[stableId]) {
                remap[eq.id] = seen[stableId];
                continue;
            }
            seen[stableId] = stableId;
            if (eq.id !== stableId) remap[eq.id] = stableId;
            eq.id = stableId;
            cleaned.push(eq);
        }
        if (Object.keys(remap).length === 0) return; // nothing to fix
        data.equipment = cleaned;
        function r(id) { return (id && remap[id]) || id; }
        // Remap exerciseEquipment
        if (data.exerciseEquipment) {
            for (var ek in data.exerciseEquipment) {
                var v = data.exerciseEquipment[ek];
                if (v && remap[v]) data.exerciseEquipment[ek] = remap[v];
            }
        }
        // Remap exerciseEquipmentOptions
        if (data.exerciseEquipmentOptions) {
            for (var ek2 in data.exerciseEquipmentOptions) {
                var opts = data.exerciseEquipmentOptions[ek2] || [];
                var newOpts = [], s2 = {};
                for (var oi = 0; oi < opts.length; oi++) {
                    var m = r(opts[oi]);
                    if (!s2[m]) { s2[m] = true; newOpts.push(m); }
                }
                data.exerciseEquipmentOptions[ek2] = newOpts;
            }
        }
        // Remap gymEquipmentMap
        if (data.gymEquipmentMap) {
            for (var gid in data.gymEquipmentMap) {
                var gmap = data.gymEquipmentMap[gid];
                for (var mk in gmap) {
                    if (gmap[mk] && remap[gmap[mk]]) gmap[mk] = remap[gmap[mk]];
                }
            }
        }
        // Remap log entries equipmentId
        if (data.log) {
            for (var w in data.log) {
                for (var d in data.log[w]) {
                    var dayLog = data.log[w][d];
                    for (var exK in dayLog) {
                        if (exK.charAt(0) === '_' || typeof dayLog[exK] !== 'object' || dayLog[exK] === null) continue;
                        for (var si in dayLog[exK]) {
                            var sd = dayLog[exK][si];
                            if (sd && sd.equipmentId && remap[sd.equipmentId]) {
                                sd.equipmentId = remap[sd.equipmentId];
                            }
                        }
                    }
                }
            }
        }
        console.log('Post-sync eq normalize: remapped', Object.keys(remap).length, 'IDs');
    },

    // Called by Storage._save() to trigger cloud sync
    onLocalSave() {
        if (this._syncing) return; // don't push partially-merged data
        if (this._currentSupaUserId && this._currentStorageKey) {
            this.schedulePush(this._currentSupaUserId, this._currentStorageKey);
        }
    }
};

// When device comes back online, push any offline changes via full sync
window.addEventListener('online', function() {
    if (SupaSync._currentSupaUserId && SupaSync._currentStorageKey && !SupaSync._syncing) {
        SupaSync.syncOnLogin(
            SupaSync._currentSupaUserId,
            SupaSync._currentStorageKey
        ).then(function() {
            Storage._invalidateCache();
            // Notify App to update UI and debounce visibilitychange
            if (SupaSync._onSyncComplete) SupaSync._onSyncComplete();
        }).catch(function(e) {
            console.error('Online sync error:', e);
        });
    }
});
