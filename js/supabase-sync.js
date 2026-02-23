// supabase-sync.js — Supabase Auth + Cloud Sync

const SUPABASE_URL = 'https://mqyfdbfdeuwojgexhwpy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWZkYmZkZXV3b2pnZXhod3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE1OTYsImV4cCI6MjA4NzQ0NzU5Nn0.5okpQM-UffmYatsVjbzjafsHhY3taCqhDYkiyEjiSvg';

// Initialize Supabase client (global `supabase` from CDN)
const supa = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const SupaSync = {
    _saveTimer: null,
    _syncing: false,

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
            console.error('Supabase push error:', result.error.message);
            return false;
        }
        return true;
    },

    // Sync on login: merge local ↔ cloud
    async syncOnLogin(supaUserId, localStorageKey) {
        if (!supa || this._syncing) return;
        this._syncing = true;
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
            } else if (remote && localData) {
                // Both exist: compare timestamps
                var remoteTime = new Date(remote.updated_at).getTime();
                var localTime = localData._lastModified || 0;
                if (remoteTime > localTime) {
                    localStorage.setItem(localStorageKey, JSON.stringify(remote.data));
                } else {
                    await this.pushData(supaUserId, localData, '');
                }
            }
        } catch (e) {
            console.error('Sync error:', e);
        } finally {
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

    // Called by Storage._save() to trigger cloud sync
    onLocalSave() {
        if (this._currentSupaUserId && this._currentStorageKey) {
            this.schedulePush(this._currentSupaUserId, this._currentStorageKey);
        }
    }
};
