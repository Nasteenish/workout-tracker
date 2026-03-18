/* ===== Profile Save & Checkin Form ===== */
const ProfileManager = {
    croppedAvatarBlob: null,
    checkinPhotos: [],
    checkinTaggedUsers: [],

    saveProfile() {
        var btn = document.getElementById('btn-profile-save');
        if (btn) { btn.disabled = true; btn.textContent = 'Сохранение...'; }

        var data = {
            display_name: (document.getElementById('edit-display-name').value || '').trim(),
            username: (document.getElementById('edit-username').value || '').trim().toLowerCase(),
            bio: (document.getElementById('edit-bio').value || '').trim(),
            gender: document.getElementById('edit-gender') ? document.getElementById('edit-gender').value : '',
            is_athlete: document.getElementById('edit-is-athlete').checked,
            is_pro: document.getElementById('edit-is-pro') ? document.getElementById('edit-is-pro').checked : false,
            category: document.getElementById('edit-category') ? document.getElementById('edit-category').value : '',
            coach: document.getElementById('edit-coach') ? document.getElementById('edit-coach').value.trim() : '',
            phase: document.getElementById('edit-phase') ? document.getElementById('edit-phase').value : ''
        };

        if (!data.username || data.username.length < 2) {
            alert('Username минимум 2 символа');
            if (btn) { btn.disabled = false; btn.textContent = 'Сохранить'; }
            return;
        }

        var avatarPromise = this.croppedAvatarBlob
            ? Social.uploadAvatar(this.croppedAvatarBlob)
            : Promise.resolve(null);

        var self = this;
        avatarPromise.then(function(avatarUrl) {
            if (avatarUrl) data.avatar_url = avatarUrl;
            self.croppedAvatarBlob = null;
            return Social.upsertProfile(data);
        }).then(function() {
            location.hash = '#/profile';
        }).catch(function(err) {
            alert(err.message || 'Ошибка сохранения');
            if (btn) { btn.disabled = false; btn.textContent = 'Сохранить'; }
        });
    },

    submitCheckin() {
        var btn = document.getElementById('btn-checkin-submit');
        var errEl = document.getElementById('checkin-error');
        if (btn) { btn.disabled = true; btn.textContent = 'ПУБЛИКАЦИЯ...'; }
        if (errEl) errEl.style.display = 'none';

        if (!this.checkinPhotos || this.checkinPhotos.length === 0) {
            if (errEl) { errEl.textContent = 'Добавьте хотя бы одно фото или видео'; errEl.style.display = 'block'; }
            if (btn) { btn.disabled = false; btn.textContent = 'ОПУБЛИКОВАТЬ'; }
            return;
        }

        var weightEl = document.getElementById('checkin-weight');
        var weight = weightEl ? (parseFloat(weightEl.value) || null) : null;
        var note = (document.getElementById('checkin-note').value || '').trim();
        var measurements = {};

        var workoutDataEl = document.getElementById('checkin-workout-data');
        var workoutSummary = null;
        if (workoutDataEl) {
            try { workoutSummary = JSON.parse(workoutDataEl.value); } catch (e) {}
        }

        var photoPromises = this.checkinPhotos.map(function(file) {
            return Social.uploadCheckinPhoto(file);
        });

        var self = this;
        Promise.all(photoPromises).then(function(photoUrls) {
            var data = {
                weight: weight,
                note: note,
                measurements: Object.keys(measurements).length > 0 ? measurements : {},
                photos: photoUrls.filter(Boolean),
                workout_summary: workoutSummary
            };
            return Social.createCheckin(data);
        }).then(function(checkin) {
            var taggedUsers = self.checkinTaggedUsers || [];
            if (taggedUsers.length && checkin && checkin.id) {
                var tagIds = taggedUsers.map(function(u) { return u.user_id; });
                Social.tagUsers(checkin.id, tagIds).catch(function() {});
            }
            self.checkinPhotos = [];
            self.checkinTaggedUsers = [];
            location.hash = '#/profile';
        }).catch(function(err) {
            if (errEl) { errEl.textContent = err.message || 'Ошибка публикации'; errEl.style.display = 'block'; }
            if (btn) { btn.disabled = false; btn.textContent = 'ОПУБЛИКОВАТЬ'; }
        });
    }
};
