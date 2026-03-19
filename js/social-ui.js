// social-ui.js — UI rendering for social features: profile, feed, check-in, discover
import { Social } from './social.js';
import { Storage } from './storage.js';
import { ProfileManager } from './profile-manager.js';
import { esc } from './utils.js';
import { SOCIAL, attr, read } from './data-attrs.js';

export const SocialUI = {
    _feedCursor: null,
    _profileCheckinsCursor: null,
    _replyToCommentId: null,

    // Dumbbell-heart SVG for like button
    _likeIconSVG: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5a3.5 3.5 0 0 1 5.5-2.9L12 10l4.5-3.4A3.5 3.5 0 0 1 22 9.5c0 2-1.5 3.8-3.2 5.3L12 21l-6.8-6.2C3.5 13.3 2 11.5 2 9.5z"/></svg>',
    _commentIconSVG: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',

    // Preload all photo URLs so browser has them cached before rendering
    _preloadPhotos(checkins) {
        var urls = [];
        checkins.forEach(function(c) {
            if (c.photos && c.photos.length) c.photos.forEach(function(u) { urls.push(u); });
            if (c.profiles && c.profiles.avatar_url) urls.push(c.profiles.avatar_url);
        });
        if (!urls.length) return Promise.resolve();
        return Promise.all(urls.map(function(url) {
            return new Promise(function(resolve) {
                var img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = url;
            });
        }));
    },

    // ===== TAB BAR =====
    _tabBarMsgCount: 0,

    _tabBarHTML(activeTab) {
        var msgCount = this._tabBarMsgCount || 0;
        var tabs = [
            { id: 'workouts', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="7" width="3" height="10" rx="1"/><rect x="5" y="4" width="3" height="16" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><rect x="16" y="4" width="3" height="16" rx="1"/><rect x="20" y="7" width="3" height="10" rx="1"/></svg>', label: 'Трени', hash: '' },
            { id: 'feed', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>', label: 'Лента', hash: '#/feed' },
            { id: 'profile', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: 'Профиль', hash: '#/profile' }
        ];
        var html = '<nav class="tab-bar">';
        tabs.forEach(function(tab) {
            var cls = tab.id === activeTab ? ' active' : '';
            html += '<a class="tab-item' + cls + '" href="' + (tab.hash || '#/') + '">';
            html += '<span class="tab-icon">' + tab.icon;
            if (tab.badge > 0) html += '<span class="tab-badge">' + tab.badge + '</span>';
            html += '</span>';
            html += '<span class="tab-label">' + tab.label + '</span>';
            html += '</a>';
        });
        html += '</nav>';
        return html;
    },

    // ===== PROFILE VIEW =====
    // Async data loading for profile — all API calls in one place
    async _loadProfileData(targetId, isOwn) {
        var results = await Promise.all([
            Social.getProfile(targetId),
            Social.getFollowCounts(targetId),
            !isOwn ? Social.isFollowing(targetId) : Promise.resolve(false),
            Social.getUserCheckins(targetId),
            Social.getCheckinCounts(targetId),
            Social.getUnreadMessageCount()
        ]);

        var checkins = results[3];
        var ids = checkins.map(function(c) { return c.id; });
        var extraResults = await Promise.all([
            Social.getLikesForCheckins(ids),
            this._preloadPhotos(checkins)
        ]);

        return {
            profile: results[0],
            counts: results[1],
            isFollowing: results[2],
            checkins: checkins,
            postCounts: results[4],
            msgUnread: results[5] || 0,
            likes: extraResults[0],
            cursor: checkins.length >= 20 ? checkins[checkins.length - 1].created_at : null
        };
    },

    async _buildProfileVM(userId) {
        var myId = Social._getSupaUserId();
        var isOwn = !userId || userId === myId;
        var targetId = isOwn ? myId : userId;
        if (!targetId) return { redirect: '#/login' };

        var data = await this._loadProfileData(targetId, isOwn);
        if (!data.profile && isOwn) return { redirect: '#/profile/edit' };
        if (!data.profile) return { notFound: true };

        return {
            isOwn: isOwn, targetId: targetId,
            profile: data.profile, counts: data.counts,
            isFollowing: data.isFollowing, checkins: data.checkins,
            postCounts: data.postCounts, msgUnread: data.msgUnread,
            cursor: data.cursor
        };
    },

    _renderProfile(vm) {
        var profile = vm.profile;
        var isOwn = vm.isOwn;
        var targetId = vm.targetId;

        var html = '<div class="social-screen">';
        if (isOwn) {
            html += '<div class="profile-top-icons">';
            html += '<button class="social-notif-btn" id="btn-notifications" style="position:relative">';
            html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
            html += '</button>';
            html += '<button class="social-notif-btn" id="btn-messages" style="position:relative">';
            html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
            if (vm.msgUnread > 0) html += '<span class="msg-badge">' + vm.msgUnread + '</span>';
            html += '</button>';
            html += '</div>';
        }
        html += '<div class="profile-header">';
        html += '<div class="profile-avatar-wrap">';
        html += profile.avatar_url
            ? '<img class="profile-avatar" src="' + esc(profile.avatar_url) + '" alt="">'
            : '<div class="profile-avatar profile-avatar-placeholder"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
        if (isOwn) html += '<button class="btn-profile-edit" id="btn-profile-edit"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>';
        html += '</div>';
        html += '<div class="profile-info">';
        html += '<h2 class="profile-name">' + esc(profile.display_name || profile.username) + (profile.is_pro ? ' <span class="pro-badge">IFBB PRO</span>' : '') + '</h2>';
        html += '<div class="profile-username">@' + esc(profile.username) + '</div>';
        if ((profile.is_athlete && profile.category) || profile.phase) {
            html += '<div class="profile-badges-row">';
            if (profile.is_athlete && profile.category) html += '<span class="profile-badge">' + esc(profile.category) + '</span>';
            if (profile.phase) html += '<span class="profile-phase">' + esc(profile.phase) + '</span>';
            html += '</div>';
        }
        if (profile.is_athlete && profile.coach) {
            html += '<div class="profile-coach">Тренер: ' + esc(profile.coach) + '</div>';
        }
        html += '</div>';
        html += '</div>';

        // Stats row
        html += '<div class="profile-stats">';
        html += '<a class="stat stat-link" href="#/followers/' + targetId + '"><span class="stat-num">' + (vm.counts.followers || 0) + '</span><span class="stat-label">подписчиков</span></a>';
        html += '<a class="stat stat-link" href="#/following/' + targetId + '"><span class="stat-num">' + (vm.counts.following || 0) + '</span><span class="stat-label">подписок</span></a>';
        html += '<div class="stat"><span class="stat-num">' + (vm.postCounts.workouts || 0) + '</span><span class="stat-label">тренировок</span></div>';
        html += '<div class="stat"><span class="stat-num">' + (vm.postCounts.checkins || 0) + '</span><span class="stat-label">чекинов</span></div>';
        html += '</div>';

        // Action buttons
        html += '<div class="profile-actions">';
        if (isOwn) {
            html += '<button class="btn-create-checkin" id="btn-new-checkin">Новый чекин</button>';
        } else {
            html += '<button class="btn-follow ' + (vm.isFollowing ? 'following' : '') + '" id="btn-follow" ' + attr(SOCIAL.USER, targetId) + '>';
            html += vm.isFollowing ? 'Отписаться' : 'Подписаться';
            html += '</button>';
            html += '<button class="btn-dm" id="btn-dm" ' + attr(SOCIAL.USER, targetId) + '>Написать</button>';
        }
        html += '</div>';

        // Bio
        if (profile.bio) {
            html += '<div class="profile-bio">' + esc(profile.bio) + '</div>';
        }

        // Post type tabs + grid
        html += '<div class="profile-post-tabs">';
        html += '<button class="profile-tab active" ' + attr(SOCIAL.TAB, 'all') + '>Все</button>';
        html += '<button class="profile-tab" ' + attr(SOCIAL.TAB, 'workouts') + '>Тренировки</button>';
        html += '<button class="profile-tab" ' + attr(SOCIAL.TAB, 'checkins') + '>Чекины</button>';
        html += '</div>';
        html += '<div class="profile-checkins" id="profile-posts-grid">';
        if (vm.checkins.length === 0) {
            html += '<div class="social-empty">Пока нет публикаций</div>';
        } else {
            html += this._renderProfileFeed(vm.checkins);
        }
        if (vm.cursor) {
            html += '<button class="btn-load-more" id="btn-load-more-profile" ' + attr(SOCIAL.USER, targetId) + '>Загрузить ещё</button>';
        }
        html += '</div>';
        html += '</div>';

        // Tab bar
        html += this._tabBarHTML('profile');
        return html;
    },

    async renderProfile(userId, useCache) {
        var app = document.getElementById('app');
        var myId = Social._getSupaUserId();
        var isOwn = !userId || userId === myId;

        // Instant restore from cache (back-swipe, own profile only)
        if (useCache && isOwn && this._profileCache) {
            app.innerHTML = this._profileCache;
            return;
        }

        if (!app.querySelector('.social-screen')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }

        var vm = await this._buildProfileVM(userId);
        if (vm.redirect) { location.hash = vm.redirect; return; }
        if (vm.notFound) {
            app.innerHTML = '<div class="social-screen"><div class="social-empty">Профиль не найден</div></div>';
            return;
        }

        this._tabBarMsgCount = vm.msgUnread;
        this._profileCheckinsCursor = vm.cursor;
        this._profileAllCheckins = vm.checkins;

        var html = this._renderProfile(vm);
        app.innerHTML = html;
        if (vm.isOwn) this._profileCache = html;
    },

    // ===== PROFILE EDIT =====
    async _buildProfileEditVM() {
        var myId = Social._getSupaUserId();
        if (!myId) return { redirect: '#/login' };

        var profile = await Social.getMyProfile() || {};
        if (!profile.username) {
            var currentUser = Storage.getCurrentUser();
            profile.username = currentUser ? (currentUser.login || currentUser.name || '') : '';
        }

        var maleCategories = ["Men's Physique", "Men's Classic Physique", "Men's 212 Bodybuilding", "Men's Bodybuilding"];
        var femaleCategories = ["Women's Fit Model", "Women's Bikini", "Women's Wellness", "Women's Figure", "Women's Fitness", "Women's Physique", "Women's Bodybuilding"];
        var categories = profile.gender === 'male' ? maleCategories : profile.gender === 'female' ? femaleCategories : maleCategories.concat(femaleCategories);
        var phases = ['Off-season', 'Bulk', 'Cut', 'Prep', 'Show Week'];

        return { profile: profile, categories: categories, phases: phases };
    },

    _renderProfileEdit(vm) {
        var profile = vm.profile;
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-profile-back">&larr;</button><h2>Редактирование</h2><button class="social-save" id="btn-profile-save">Сохранить</button></div>';

        // Avatar
        html += '<div class="edit-avatar-section">';
        html += profile.avatar_url
            ? '<img class="edit-avatar" id="edit-avatar-preview" src="' + esc(profile.avatar_url) + '" alt="">'
            : '<div class="edit-avatar edit-avatar-placeholder" id="edit-avatar-preview"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><span class="edit-avatar-hint">Фото</span></div>';
        html += '<label class="edit-avatar-btn" for="avatar-file-input">Изменить фото</label>';
        html += '<input type="file" id="avatar-file-input" accept="image/*" style="display:none">';
        html += '</div>';

        // Fields
        html += '<div class="edit-fields">';
        html += '<div class="edit-field"><label>Имя</label><input type="text" id="edit-display-name" value="' + esc(profile.display_name || '') + '" placeholder="Ваше имя"></div>';
        html += '<div class="edit-field"><label>Username</label><input type="text" id="edit-username" value="' + esc(profile.username || '') + '" placeholder="username" autocapitalize="none"></div>';
        html += '<div class="edit-field"><label>Bio</label><textarea id="edit-bio" rows="3" placeholder="О себе">' + esc(profile.bio || '') + '</textarea></div>';

        // Gender
        html += '<div class="edit-field"><label>Пол</label><select id="edit-gender">';
        html += '<option value="">—</option>';
        html += '<option value="male"' + (profile.gender === 'male' ? ' selected' : '') + '>Мужской</option>';
        html += '<option value="female"' + (profile.gender === 'female' ? ' selected' : '') + '>Женский</option>';
        html += '</select></div>';

        // Athlete section
        html += '<div class="edit-section-title">Атлет</div>';
        html += '<div class="edit-field edit-toggle-field"><label>Я соревнующийся атлет</label><input type="checkbox" id="edit-is-athlete"' + (profile.is_athlete ? ' checked' : '') + '></div>';

        html += '<div class="edit-athlete-fields" id="edit-athlete-fields" style="' + (profile.is_athlete ? '' : 'display:none') + '">';
        html += '<div class="edit-field edit-toggle-field"><label>IFBB PRO</label><input type="checkbox" id="edit-is-pro"' + (profile.is_pro ? ' checked' : '') + '></div>';
        html += '<div class="edit-field"><label>Категория</label><select id="edit-category"><option value="">—</option>';
        vm.categories.forEach(function(c) {
            html += '<option value="' + c + '"' + (profile.category === c ? ' selected' : '') + '>' + c + '</option>';
        });
        html += '</select></div>';
        html += '<div class="edit-field"><label>Тренер</label><input type="text" id="edit-coach" value="' + esc(profile.coach || '') + '" placeholder="Имя тренера"></div>';
        html += '<div class="edit-field"><label>Фаза</label><select id="edit-phase"><option value="">—</option>';
        vm.phases.forEach(function(p) {
            html += '<option value="' + p + '"' + (profile.phase === p ? ' selected' : '') + '>' + p + '</option>';
        });
        html += '</select></div>';
        html += '</div>'; // athlete-fields

        html += '</div>'; // edit-fields
        html += '</div>'; // social-screen
        return html;
    },

    async renderProfileEdit() {
        var app = document.getElementById('app');
        if (!app.querySelector('.edit-fields')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }
        var vm = await this._buildProfileEditVM();
        if (vm.redirect) { location.hash = vm.redirect; return; }
        app.innerHTML = this._renderProfileEdit(vm);
    },

    // ===== CHECK-IN FORM =====
    renderCheckinForm(prefillWorkout) {
        // Simplified form for sharing a workout
        if (prefillWorkout) {
            var html = '<div class="social-screen">';
            html += '<div class="social-header"><button class="social-back" id="btn-checkin-back">&larr;</button><h2>Поделиться тренировкой</h2></div>';

            // Muscle group tag (or title as fallback)
            var mg = prefillWorkout.muscle_group || prefillWorkout.title || '';
            var mgColor = SocialUI._muscleGroupColor(mg);
            if (mg) {
                html += '<div class="share-muscle-tag" style="background:' + mgColor + '">' + esc(mg) + '</div>';
            }

            // Workout title — only if different from muscle group
            if (prefillWorkout.title && prefillWorkout.title !== mg) {
                html += '<div class="share-workout-title">' + esc(prefillWorkout.title) + '</div>';
            }

            // Stats chips
            html += '<div class="share-workout-stats">';
            if (prefillWorkout.duration_sec) {
                var dm = Math.round(prefillWorkout.duration_sec / 60);
                html += '<span class="share-stat-chip"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2.5"/></svg> ' + dm + ' мин</span>';
            }
            html += '<span class="share-stat-chip"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="2" height="6" rx="0.5"/><rect x="5" y="3" width="2" height="10" rx="0.5"/><rect x="9" y="3" width="2" height="10" rx="0.5"/><rect x="12" y="5" width="2" height="6" rx="0.5"/></svg> ' + (prefillWorkout.exercises ? prefillWorkout.exercises.length : 0) + ' упр.</span>';
            if (prefillWorkout.total_sets) html += '<span class="share-stat-chip">' + prefillWorkout.total_sets + ' подх.</span>';
            html += '</div>';

            if (prefillWorkout.gym_name) {
                html += '<div class="share-gym-tag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(prefillWorkout.gym_name) + '</div>';
            }

            html += '<input type="hidden" id="checkin-workout-data" value=\'' + JSON.stringify(prefillWorkout).replace(/'/g, '&#39;') + '\'>';

            // Photo/video upload
            html += '<div class="checkin-photos-section">';
            html += '<div class="checkin-photos-grid" id="checkin-photos-grid"></div>';
            html += '<label class="checkin-add-photo" for="checkin-photo-input">+ Фото / Видео</label>';
            html += '<input type="file" id="checkin-photo-input" accept="image/*,video/*" multiple style="display:none">';
            html += '<div class="checkin-photo-hint">Обязательно</div>';
            html += '</div>';

            // Tag users
            html += '<div class="checkin-tag-section">';
            html += '<button class="checkin-tag-btn" id="btn-tag-user"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Отметить</button>';
            html += '<div class="checkin-tagged-users" id="checkin-tagged-users"></div>';
            html += '</div>';

            // Note
            html += '<div class="edit-fields">';
            html += '<div class="edit-field"><textarea id="checkin-note" rows="2" placeholder="Как прошла тренировка?"></textarea></div>';
            html += '</div>';

            html += '<button class="btn-primary checkin-submit" id="btn-checkin-submit">ОПУБЛИКОВАТЬ</button>';
            html += '<div id="checkin-error" class="login-error" style="display:none"></div>';
            html += '</div>';
            document.getElementById('app').innerHTML = html;
            ProfileManager.checkinPhotos = [];
            ProfileManager.checkinTaggedUsers = [];
            var noteEl = document.getElementById('checkin-note');
            if (noteEl) this._initMentionInput(noteEl);
            return;
        }

        // Full check-in form (weekly progress photo)
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-checkin-back">&larr;</button><h2>Новый чекин</h2></div>';

        // Photo upload
        html += '<div class="checkin-photos-section">';
        html += '<div class="checkin-photos-grid" id="checkin-photos-grid"></div>';
        html += '<label class="checkin-add-photo" for="checkin-photo-input">+ Фото / Видео</label>';
        html += '<input type="file" id="checkin-photo-input" accept="image/*,video/*" multiple style="display:none">';
        html += '<div class="checkin-photo-hint">До 3 фото/видео</div>';
        html += '</div>';

        // Tag users
        html += '<div class="checkin-tag-section">';
        html += '<button class="checkin-tag-btn" id="btn-tag-user"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Отметить</button>';
        html += '<div class="checkin-tagged-users" id="checkin-tagged-users"></div>';
        html += '</div>';

        html += '<div class="edit-fields">';
        // Weight (optional)
        html += '<div class="edit-field"><label>Вес, кг (опционально)</label><input type="number" id="checkin-weight" step="0.1" placeholder="Текущий вес"></div>';

        // Note
        html += '<div class="edit-field"><label>Заметка</label><textarea id="checkin-note" rows="3" placeholder="Как прошла неделя?"></textarea></div>';
        html += '</div>'; // edit-fields

        html += '<button class="btn-primary checkin-submit" id="btn-checkin-submit">ОПУБЛИКОВАТЬ</button>';
        html += '<div id="checkin-error" class="login-error" style="display:none"></div>';

        html += '</div>';

        document.getElementById('app').innerHTML = html;
        var noteEl = document.getElementById('checkin-note');
        if (noteEl) this._initMentionInput(noteEl);
    },

    // ===== FEED =====
    // Async data loading for feed — all API calls in one place
    async _loadFeedData() {
        var feedResults = await Promise.all([Social.getFeed(), Social.getMyFollowingIds()]);
        var checkins = feedResults[0];
        var ids = checkins.map(function(c) { return c.id; });

        var extra = await Promise.all([
            Social.getLikesForCheckins(ids),
            Social.getTagsForCheckins(ids),
            this._preloadPhotos(checkins),
            Social.getUnreadNotificationCount(),
            Social.getCommentCountsForCheckins(ids),
            Social.getUnreadMessageCount()
        ]);

        return {
            checkins: checkins,
            followingIds: feedResults[1],
            likes: extra[0],
            tags: extra[1],
            unreadCount: extra[3],
            commentCounts: extra[4],
            msgUnread: extra[5] || 0,
            cursor: checkins.length >= 20 ? checkins[checkins.length - 1].created_at : null
        };
    },

    async _buildFeedVM() {
        var data = await this._loadFeedData();
        return {
            checkins: data.checkins,
            followingIds: data.followingIds,
            likes: data.likes,
            tags: data.tags,
            unreadCount: data.unreadCount,
            commentCounts: data.commentCounts,
            msgUnread: data.msgUnread,
            cursor: data.cursor
        };
    },

    _renderFeed(vm) {
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><h2>Лента</h2>';
        // Notification bell
        html += '<button class="social-notif-btn" id="btn-notifications">';
        html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
        if (vm.unreadCount > 0) html += '<span class="notif-badge">' + vm.unreadCount + '</span>';
        html += '</button>';
        html += '<button class="social-notif-btn" id="btn-messages" style="position:relative">';
        html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        if (vm.msgUnread > 0) html += '<span class="msg-badge">' + vm.msgUnread + '</span>';
        html += '</button>';
        html += '<button class="social-discover-btn" id="btn-discover"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button></div>';

        if (vm.checkins.length === 0) {
            html += '<div class="social-empty">';
            html += '<div class="social-empty-icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg></div>';
            if (vm.followingIds.length > 0) {
                html += '<p>Пока нет чекинов</p>';
                html += '<p class="social-empty-hint">Ваши подписки ещё не публиковали чекины</p>';
            } else {
                html += '<p>Лента пуста</p>';
                html += '<p class="social-empty-hint">Подпишитесь на атлетов чтобы видеть их чекины</p>';
                html += '<button class="btn-primary" id="btn-discover-empty">Найти атлетов</button>';
            }
            html += '</div>';
        } else {
            html += this._renderCheckinCards(vm.checkins, vm.likes, vm.tags, vm.commentCounts);
            if (vm.cursor) {
                html += '<button class="btn-load-more" id="btn-load-more-feed">Загрузить ещё</button>';
            }
        }

        html += '</div>';
        html += this._tabBarHTML('feed');
        return html;
    },

    async renderFeed(useCache) {
        var app = document.getElementById('app');
        if (useCache && this._feedCache) {
            app.innerHTML = this._feedCache;
            return;
        }
        if (!app.querySelector('.social-screen')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>' + this._tabBarHTML('feed');
        }

        var vm = await this._buildFeedVM();
        this._feedCursor = vm.cursor;
        this._tabBarMsgCount = vm.msgUnread;

        var html = this._renderFeed(vm);
        app.innerHTML = html;
        this._feedCache = html;
    },

    // ===== CHECKIN DETAIL =====
    // Async data loading for checkin detail — all API calls in one place
    async _loadCheckinData(checkinId) {
        var results = await Promise.all([
            Social.getCheckin(checkinId),
            Social.getReactions(checkinId),
            Social.getComments(checkinId),
            Social.getTagsForCheckin(checkinId)
        ]);
        var checkin = results[0];
        if (checkin) await this._preloadPhotos([checkin]);
        var comments = results[2];

        var commentIds = comments.map(function(c) { return c.id; });
        var commentLikes = commentIds.length ? await Social.getCommentLikes(commentIds) : { counts: {}, myLikes: new Set() };

        var myId = Social._getSupaUserId();
        var reactions = results[1];

        // Pre-thread comments
        var topLevel = comments.filter(function(c) { return !c.parent_id; });
        var replies = {};
        comments.forEach(function(c) {
            if (c.parent_id) {
                if (!replies[c.parent_id]) replies[c.parent_id] = [];
                replies[c.parent_id].push(c);
            }
        });

        return {
            checkin: checkin,
            reactions: reactions,
            myReaction: reactions.find(function(r) { return r.user_id === myId; }),
            comments: comments,
            photoTags: results[3],
            commentLikes: commentLikes,
            isOwn: checkin ? checkin.user_id === myId : false,
            topLevel: topLevel,
            replies: replies,
            myId: myId
        };
    },

    async _buildCheckinDetailVM(checkinId) {
        var data = await this._loadCheckinData(checkinId);
        if (!data.checkin) return { notFound: true };
        return {
            checkinId: checkinId,
            checkin: data.checkin,
            reactions: data.reactions,
            myReaction: data.myReaction,
            comments: data.comments,
            photoTags: data.photoTags,
            commentLikes: data.commentLikes,
            isOwn: data.isOwn,
            myId: data.myId,
            topLevel: data.topLevel,
            replies: data.replies
        };
    },

    _renderCheckinComment(c, isReply, myId, commentLikes) {
        var isMine = c.user_id === myId;
        var authorName = c.profiles ? (c.profiles.display_name || c.profiles.username) : '?';
        var authorUsername = c.profiles ? c.profiles.username : '';
        var clCount = commentLikes.counts[c.id] || 0;
        var clLiked = commentLikes.myLikes.has ? commentLikes.myLikes.has(c.id) : false;
        var h = '<div class="comment-item' + (isReply ? ' comment-reply' : '') + '">';
        h += '<div class="comment-avatar comment-profile-link" ' + attr(SOCIAL.USERNAME, esc(authorUsername)) + '>';
        h += c.profiles && c.profiles.avatar_url
            ? '<img src="' + esc(c.profiles.avatar_url) + '" alt="">'
            : '<div class="avatar-placeholder-sm"></div>';
        h += '</div>';
        h += '<div class="comment-body">';
        h += '<span class="comment-author comment-profile-link" ' + attr(SOCIAL.USERNAME, esc(authorUsername)) + '>' + esc(authorName) + '</span> ';
        h += '<span class="comment-text">' + SocialUI._renderMentionText(c.text) + '</span>';
        h += '<div class="comment-meta">';
        h += '<span class="comment-time">' + SocialUI._timeAgo(c.created_at) + '</span>';
        if (!isMine) h += '<button class="comment-reply-btn" ' + attr(SOCIAL.USERNAME, esc(authorUsername)) + ' ' + attr(SOCIAL.COMMENT_ID, c.id) + '>Ответить</button>';
        h += '<button class="comment-like-btn' + (clLiked ? ' active' : '') + '" ' + attr(SOCIAL.COMMENT, c.id) + '>';
        h += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        h += '<span class="comment-like-count">' + (clCount > 0 ? clCount : '') + '</span>';
        h += '</button>';
        h += '</div>';
        h += '</div>';
        if (isMine) h += '<button class="comment-delete" ' + attr(SOCIAL.COMMENT, c.id) + '>&times;</button>';
        h += '</div>';
        return h;
    },

    _renderCheckinDetail(vm) {
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-checkin-detail-back">&larr;</button><h2>Check-in</h2>';
        if (vm.isOwn) html += '<button class="checkin-delete-btn" id="btn-delete-checkin" ' + attr(SOCIAL.CHECKIN, vm.checkin.id) + '><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>';
        html += '</div>';

        // Full card
        html += this._renderFullCheckin(vm.checkin, vm.reactions, vm.myReaction, vm.photoTags);

        // Photo tags list (detail view)
        if (vm.photoTags && vm.photoTags.length) {
            html += '<div class="photo-tags-detail">';
            html += '<span class="photo-tags-label">Отмечены: </span>';
            html += vm.photoTags.map(function(t) {
                var p = t.profiles || t;
                return '<a class="photo-tag-link" href="#/u/' + esc(p.username || '') + '">@' + esc(p.username || p.display_name || '?') + '</a>';
            }).join(', ');
            html += '</div>';
        }

        var self = this;
        html += '<div class="checkin-comments">';
        html += '<h3>Комментарии (' + vm.comments.length + ')</h3>';
        vm.topLevel.forEach(function(c) {
            html += self._renderCheckinComment(c, false, vm.myId, vm.commentLikes);
            var reps = vm.replies[c.id];
            if (reps && reps.length) {
                html += '<div class="comment-replies">';
                reps.forEach(function(r) { html += self._renderCheckinComment(r, true, vm.myId, vm.commentLikes); });
                html += '</div>';
            }
        });

        // Reply indicator (hidden by default)
        html += '<div class="reply-indicator" id="reply-indicator" style="display:none">';
        html += 'Ответ для <b id="reply-indicator-name"></b>';
        html += '<button class="reply-cancel" id="btn-reply-cancel">&times;</button>';
        html += '</div>';

        // Comment input
        html += '<div class="comment-input-row">';
        html += '<input type="text" id="comment-input" placeholder="Написать комментарий...">';
        html += '<button class="comment-send" id="btn-send-comment" ' + attr(SOCIAL.CHECKIN, vm.checkinId) + '>Отправить</button>';
        html += '</div>';
        html += '</div>'; // comments

        html += '</div>'; // social-screen
        return html;
    },

    async renderCheckinDetail(checkinId) {
        var app = document.getElementById('app');
        if (!app.querySelector('.checkin-full')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }

        var vm = await this._buildCheckinDetailVM(checkinId);
        if (vm.notFound) {
            app.innerHTML = '<div class="social-screen"><div class="social-empty">Чекин не найден</div></div>';
            return;
        }

        app.innerHTML = this._renderCheckinDetail(vm);

        // Init @mention autocomplete on comment input
        var commentInput = document.getElementById('comment-input');
        if (commentInput) this._initMentionInput(commentInput);
    },

    // ===== DISCOVER =====
    async _buildDiscoverVM() {
        var myId = Social._getSupaUserId();
        var results = await Promise.all([Social.getRecentUsers(), Social.getMyFollowingIds()]);
        return { users: results[0], followingIds: results[1], myId: myId };
    },

    _renderDiscover(vm) {
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-discover-back">&larr;</button><h2>Поиск</h2></div>';
        html += '<div class="discover-search"><input type="text" id="discover-search-input" placeholder="Поиск по имени..."><button class="discover-search-btn" id="btn-discover-search"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button></div>';
        html += '<div class="discover-results" id="discover-results">';
        html += this._renderUserList(vm.users, vm.myId, vm.followingIds);
        html += '</div>';
        html += '</div>';
        return html;
    },

    async renderDiscover(useCache) {
        var app = document.getElementById('app');
        if (useCache && this._discoverCache) {
            app.innerHTML = this._discoverCache;
            return;
        }
        if (!app.querySelector('.discover-results')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }

        var vm = await this._buildDiscoverVM();
        var html = this._renderDiscover(vm);
        app.innerHTML = html;
        this._discoverCache = html;

        var searchInput = document.getElementById('discover-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') document.getElementById('btn-discover-search').click();
            });
        }
    },

    // ===== RENDER HELPERS =====

    _renderProfileFeed(checkins, noWrap) {
        var html = noWrap ? '' : '<div class="profile-feed">';
        checkins.forEach(function(c) {
            var isWorkout = !!c.workout_summary;
            html += '<div class="profile-feed-item" ' + attr(SOCIAL.CHECKIN, c.id) + '>';
            // Date
            html += '<div class="profile-feed-date">' + SocialUI._timeAgo(c.created_at) + '</div>';
            // Photos/video
            if (c.photos && c.photos.length > 0) {
                html += '<div class="profile-feed-photo">' + SocialUI._mediaTag(c.photos[0], 'profile-feed-img', ' loading="lazy"') + '</div>';
                if (c.photos.length > 1) html += '<div class="profile-feed-more-photos">+' + (c.photos.length - 1) + ' фото</div>';
            }
            // Workout info (no photo)
            if (isWorkout) {
                var ws = c.workout_summary;
                var title = ws.title || ws.muscle_group || 'Тренировка';
                var stats = [];
                if (ws.exercises) stats.push(ws.exercises.length + ' упр.');
                if (ws.total_sets) stats.push(ws.total_sets + ' подх.');
                if (ws.duration_sec) stats.push(Math.round(ws.duration_sec / 60) + ' мин');
                if (!(c.photos && c.photos.length > 0)) {
                    html += '<div class="profile-feed-workout">';
                    html += '<div class="profile-feed-workout-title">' + esc(title) + '</div>';
                    if (stats.length) html += '<div class="profile-feed-workout-stats">' + stats.join(' · ') + '</div>';
                    html += '</div>';
                }
            }
            // Caption
            if (c.note) html += '<div class="profile-feed-caption">' + esc(c.note) + '</div>';
            if (c.weight) html += '<div class="profile-feed-caption">' + esc(c.weight) + ' кг</div>';
            html += '</div>';
        });
        html += noWrap ? '' : '</div>';
        return html;
    },

    _profileAllCheckins: null,

    _renderCheckinCards(checkins, likes, tags, commentCounts) {
        var likeData = likes || { counts: {}, myLikes: new Set() };
        var tagData = tags || {};
        var commentCountData = commentCounts || {};
        var html = '';
        checkins.forEach(function(c) {
            html += '<div class="checkin-card" ' + attr(SOCIAL.CHECKIN, c.id) + '>';
            // Author row
            html += '<div class="checkin-author">';
            html += c.profiles && c.profiles.avatar_url
                ? '<img class="checkin-author-avatar" src="' + esc(c.profiles.avatar_url) + '" alt="">'
                : '<div class="checkin-author-avatar avatar-placeholder-sm"></div>';
            html += '<div class="checkin-author-info">';
            html += '<span class="checkin-author-name">' + esc(c.profiles ? (c.profiles.display_name || c.profiles.username) : '?') + (c.profiles && c.profiles.is_pro ? ' <span class="pro-badge">IFBB PRO</span>' : '') + '</span>';
            html += '<span class="checkin-time">' + SocialUI._timeAgo(c.created_at) + '</span>';
            html += '</div>';
            html += '</div>';

            // Photos
            if (c.photos && c.photos.length > 0) {
                html += '<div class="checkin-photos' + (c.photos.length > 1 ? ' multi' : '') + '">';
                c.photos.forEach(function(url) {
                    html += SocialUI._mediaTag(url, 'checkin-photo', '');
                });
                // Photo tags badge
                var cTags = tagData[c.id];
                if (cTags && cTags.length) {
                    html += '<div class="photo-tag-badge">с ' + cTags.map(function(t) { return '@' + esc(t.username || t.display_name); }).join(', ') + '</div>';
                }
                html += '</div>';
            }

            // Weight + measurements
            var meta = [];
            if (c.weight) meta.push(c.weight + ' ' + (c.weight_unit || 'kg'));
            if (c.measurements) {
                var m = c.measurements;
                if (m.waist) meta.push('Талия: ' + m.waist);
                if (m.bicep) meta.push('Бицепс: ' + m.bicep);
                if (m.chest) meta.push('Грудь: ' + m.chest);
                if (m.thigh) meta.push('Бедро: ' + m.thigh);
            }
            if (meta.length) html += '<div class="checkin-meta">' + meta.join(' &middot; ') + '</div>';

            // Workout summary
            if (c.workout_summary) {
                var ws = c.workout_summary;
                var wsLabel = ws.title || ws.muscle_group || 'Тренировка';
                var mgClr = SocialUI._muscleGroupColor(ws.muscle_group || wsLabel);
                html += '<div class="checkin-workout">';
                html += '<span class="checkin-muscle-tag" style="background:' + mgClr + '">' + esc(wsLabel) + '</span>';
                var wStats = [];
                if (ws.duration_sec) wStats.push(Math.round(ws.duration_sec / 60) + ' мин');
                if (ws.exercises) wStats.push(ws.exercises.length + ' упр.');
                if (ws.total_sets) wStats.push(ws.total_sets + ' подх.');
                if (wStats.length) html += '<span class="checkin-workout-stats">' + wStats.join(' · ') + '</span>';
                if (ws.gym_name) html += '<span class="checkin-gym-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(ws.gym_name) + '</span>';
                if (ws.exercises && ws.exercises.length) {
                    html += '<div class="checkin-workout-exercises">';
                    var firstEx = ws.exercises[0];
                    html += '<div class="workout-ex-item">';
                    html += '<div class="workout-ex-name">' + esc(firstEx.name) + '</div>';
                    if (firstEx.logged && firstEx.logged.length) {
                        firstEx.logged.forEach(function(s, idx) {
                            var parts = [];
                            if (s.weight) parts.push(s.weight + ' ' + (s.unit || 'kg'));
                            if (s.reps) parts.push('x ' + s.reps);
                            var line = parts.join(' ') || '—';
                            if (s.equipment) line += ' <span class="workout-eq">' + esc(s.equipment) + '</span>';
                            html += '<div class="workout-set-line">' + (idx + 1) + '. ' + line + '</div>';
                        });
                    } else if (firstEx.sets) {
                        html += '<div class="workout-set-line">' + firstEx.sets + ' подх.</div>';
                    }
                    html += '</div>';
                    if (ws.exercises.length > 1) html += '<div class="workout-more-hint">+ ещё ' + (ws.exercises.length - 1) + ' упр.</div>';
                    html += '</div>';
                }
                html += '</div>';
            }

            // Note
            if (c.note) html += '<div class="checkin-note">' + SocialUI._renderMentionText(c.note) + '</div>';

            // Like bar
            var likeCount = likeData.counts[c.id] || 0;
            var isLiked = likeData.myLikes.has ? likeData.myLikes.has(c.id) : false;
            html += '<div class="like-bar">';
            html += '<button class="like-btn' + (isLiked ? ' active' : '') + '" ' + attr(SOCIAL.CHECKIN, c.id) + '>';
            html += SocialUI._likeIconSVG;
            html += '<span class="like-count">' + (likeCount > 0 ? likeCount : '') + '</span>';
            html += '</button>';
            var cc = commentCountData[c.id] || 0;
            html += '<button class="comment-btn-icon" ' + attr(SOCIAL.CHECKIN, c.id) + '>';
            html += SocialUI._commentIconSVG;
            html += '<span class="comment-count">' + (cc > 0 ? cc : '') + '</span>';
            html += '</button>';
            html += '</div>';

            html += '</div>'; // card
        });
        return html;
    },

    _renderFullCheckin(checkin, reactions, myReaction, photoTags) {
        var c = checkin;
        var html = '<div class="checkin-card checkin-full">';

        // Author
        html += '<div class="checkin-author" ' + attr(SOCIAL.USERNAME, esc(c.profiles ? c.profiles.username : '')) + '>';
        html += c.profiles && c.profiles.avatar_url
            ? '<img class="checkin-author-avatar" src="' + esc(c.profiles.avatar_url) + '" alt="">'
            : '<div class="checkin-author-avatar avatar-placeholder-sm"></div>';
        html += '<div class="checkin-author-info">';
        html += '<span class="checkin-author-name">' + esc(c.profiles ? (c.profiles.display_name || c.profiles.username) : '?') + (c.profiles && c.profiles.is_pro ? ' <span class="pro-badge">IFBB PRO</span>' : '') + '</span>';
        html += '<span class="checkin-time">' + SocialUI._timeAgo(c.created_at) + '</span>';
        html += '</div>';
        html += '</div>';

        // Photos
        if (c.photos && c.photos.length > 0) {
            html += '<div class="checkin-photos' + (c.photos.length > 1 ? ' multi' : '') + '">';
            c.photos.forEach(function(url) {
                html += SocialUI._mediaTag(url, 'checkin-photo', '');
            });
            // Photo tags badge
            if (photoTags && photoTags.length) {
                html += '<div class="photo-tag-badge">с ' + photoTags.map(function(t) {
                    var p = t.profiles || t;
                    return '@' + esc(p.username || p.display_name || '?');
                }).join(', ') + '</div>';
            }
            html += '</div>';
        }

        // Weight + measurements
        var meta = [];
        if (c.weight) meta.push(c.weight + ' ' + (c.weight_unit || 'kg'));
        if (c.measurements) {
            var m = c.measurements;
            if (m.waist) meta.push('Талия: ' + m.waist);
            if (m.bicep) meta.push('Бицепс: ' + m.bicep);
            if (m.chest) meta.push('Грудь: ' + m.chest);
            if (m.thigh) meta.push('Бедро: ' + m.thigh);
        }
        if (meta.length) html += '<div class="checkin-meta">' + meta.join(' &middot; ') + '</div>';

        // Workout summary
        if (c.workout_summary) {
            var ws = c.workout_summary;
            html += '<div class="checkin-workout">';
            var dLabel = ws.title || ws.muscle_group || 'Тренировка';
            var dMgClr = SocialUI._muscleGroupColor(ws.muscle_group || dLabel);
            html += '<span class="checkin-muscle-tag" style="background:' + dMgClr + '">' + esc(dLabel) + '</span>';
            if (ws.duration_sec) html += ' ' + Math.round(ws.duration_sec / 60) + ' мин';
            if (ws.gym_name) html += '<div class="checkin-gym-tag" style="margin-top:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + esc(ws.gym_name) + '</div>';
            if (ws.exercises && ws.exercises.length) {
                html += '<div class="checkin-workout-exercises">';
                ws.exercises.forEach(function(e) {
                    html += '<div class="workout-ex-item">';
                    html += '<div class="workout-ex-name">' + esc(e.name) + '</div>';
                    if (e.logged && e.logged.length) {
                        e.logged.forEach(function(s, idx) {
                            var parts = [];
                            if (s.weight != null && s.weight !== '') parts.push(s.weight + ' ' + (s.unit || 'kg'));
                            if (s.reps) parts.push('x ' + s.reps);
                            var line = parts.join(' ') || '—';
                            if (s.equipment) line += ' <span class="workout-eq">' + esc(s.equipment) + '</span>';
                            html += '<div class="workout-set-line">' + (idx + 1) + '. ' + line + '</div>';
                        });
                    } else if (e.sets) {
                        html += '<div class="workout-set-line">' + e.sets + ' подх.</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
            }
            html += '</div>';
        }

        if (c.note) html += '<div class="checkin-note">' + SocialUI._renderMentionText(c.note) + '</div>';

        // Like bar (single like, Instagram-style)
        var likeCount = reactions ? reactions.length : 0;
        var isLiked = !!myReaction;
        html += '<div class="like-bar">';
        html += '<button class="like-btn' + (isLiked ? ' active' : '') + '" ' + attr(SOCIAL.CHECKIN, c.id) + '>';
        html += SocialUI._likeIconSVG;
        html += '<span class="like-count">' + (likeCount > 0 ? likeCount : '') + '</span>';
        html += '</button>';
        html += '<button class="comment-btn-icon" ' + attr(SOCIAL.CHECKIN, c.id) + '>';
        html += SocialUI._commentIconSVG;
        html += '</button>';
        html += '</div>';

        html += '</div>';
        return html;
    },

    _renderUserList(users, myId, followingIds) {
        var fIds = followingIds || [];
        var filtered = users.filter(function(u) { return u.user_id !== myId; });
        if (!filtered.length) return '<div class="social-empty">Никого не найдено</div>';
        var html = '';
        filtered.forEach(function(u) {
            var isFollowed = fIds.indexOf(u.user_id) !== -1;
            html += '<div class="discover-user">';
            html += u.avatar_url
                ? '<img class="discover-user-avatar" src="' + esc(u.avatar_url) + '" alt="">'
                : '<div class="discover-user-avatar avatar-placeholder-sm"></div>';
            html += '<div class="discover-user-info">';
            html += '<div class="discover-user-name">' + esc(u.display_name || u.username) + '</div>';
            html += '<div class="discover-user-username">@' + esc(u.username) + '</div>';
            if (u.is_athlete && u.category) html += '<div class="discover-user-badge">' + esc(u.category) + '</div>';
            html += '</div>';
            if (isFollowed) {
                html += '<button class="btn-follow-sm followed" ' + attr(SOCIAL.USER, u.user_id) + ' disabled>Подписан</button>';
            } else {
                html += '<button class="btn-follow-sm" ' + attr(SOCIAL.USER, u.user_id) + '>Подписаться</button>';
            }
            html += '</div>';
        });
        return html;
    },

    // ===== FOLLOWERS / FOLLOWING LIST =====
    async _buildFollowListVM(userId, type) {
        var isFollowers = type === 'followers';
        var results = await Promise.all([
            isFollowers ? Social.getFollowers(userId) : Social.getFollowing(userId),
            Social.getMyFollowingIds()
        ]);
        return {
            title: isFollowers ? 'Подписчики' : 'Подписки',
            users: results[0],
            followingIds: results[1],
            myId: Social._getSupaUserId()
        };
    },

    _renderFollowList(vm) {
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-followlist-back">&larr;</button><h2>' + vm.title + '</h2></div>';
        html += '<div class="discover-results">';
        html += this._renderUserList(vm.users, vm.myId, vm.followingIds);
        html += '</div>';
        html += '</div>';
        return html;
    },

    async renderFollowList(userId, type) {
        var app = document.getElementById('app');
        app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        var vm = await this._buildFollowListVM(userId, type);
        app.innerHTML = this._renderFollowList(vm);
    },

    // ===== NOTIFICATIONS PAGE =====
    async _buildNotificationsVM() {
        var notifications = await Social.getNotifications(50);
        var items = notifications.map(function(n) {
            var p = n.from_profile;
            var name = p ? (p.display_name || p.username || '?') : '?';
            var avatarUrl = p ? p.avatar_url : null;
            var text = '';
            var link = '';
            if (n.type === 'like') { text = ' поставил(а) лайк'; link = n.checkin_id ? '#/checkin/' + n.checkin_id : ''; }
            else if (n.type === 'comment') { text = ' прокомментировал(а)'; link = n.checkin_id ? '#/checkin/' + n.checkin_id : ''; }
            else if (n.type === 'follow') { text = ' подписался(-ась) на вас'; link = p ? '#/u/' + p.username : ''; }
            else if (n.type === 'tag') { text = ' отметил(а) вас на фото'; link = n.checkin_id ? '#/checkin/' + n.checkin_id : ''; }
            return { name: name, avatarUrl: avatarUrl, text: text, link: link, read: n.read, created_at: n.created_at };
        });
        return { items: items };
    },

    _renderNotifications(vm) {
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-notif-back">&larr;</button><h2>Уведомления</h2></div>';
        if (!vm.items.length) {
            html += '<div class="social-empty"><p>Нет уведомлений</p></div>';
        } else {
            html += '<div class="notif-list">';
            vm.items.forEach(function(item) {
                var avatar = item.avatarUrl
                    ? '<img class="notif-avatar" src="' + esc(item.avatarUrl) + '" alt="">'
                    : '<div class="notif-avatar avatar-placeholder-sm"></div>';
                html += '<a class="notif-item' + (item.read ? '' : ' unread') + '" href="' + item.link + '">';
                html += avatar;
                html += '<div class="notif-body">';
                html += '<span class="notif-name">' + esc(item.name) + '</span>';
                html += '<span class="notif-text">' + item.text + '</span>';
                html += '<div class="notif-time">' + SocialUI._timeAgo(item.created_at) + '</div>';
                html += '</div>';
                html += '</a>';
            });
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    async renderNotifications() {
        var app = document.getElementById('app');
        app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        var vm = await this._buildNotificationsVM();
        Social.markNotificationsRead();
        app.innerHTML = this._renderNotifications(vm);
    },

    // ===== TAG USER SEARCH (for checkin form) =====
    async renderTagSearch(onSelect) {
        // This creates a modal-like overlay for searching users to tag
        var overlay = document.createElement('div');
        overlay.className = 'tag-search-overlay';
        overlay.innerHTML = '<div class="tag-search-modal">' +
            '<div class="tag-search-header"><h3>Отметить</h3><button class="tag-search-close">&times;</button></div>' +
            '<input type="text" class="tag-search-input" placeholder="Поиск по имени...">' +
            '<div class="tag-search-results"></div>' +
            '</div>';
        document.body.appendChild(overlay);

        var input = overlay.querySelector('.tag-search-input');
        var results = overlay.querySelector('.tag-search-results');
        var closeBtn = overlay.querySelector('.tag-search-close');

        closeBtn.onclick = function() { overlay.remove(); };
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        input.focus();
        var timeout;
        input.oninput = function() {
            clearTimeout(timeout);
            var q = input.value.trim();
            if (!q) { results.innerHTML = ''; return; }
            timeout = setTimeout(function() {
                Social.searchUsers(q).then(function(users) {
                    var myId = Social._getSupaUserId();
                    var html = '';
                    users.filter(function(u) { return u.user_id !== myId; }).forEach(function(u) {
                        html += '<div class="tag-search-user" ' + attr(SOCIAL.UID, u.user_id) + ' ' + attr(SOCIAL.USERNAME, esc(u.username)) + ' ' + attr(SOCIAL.DISPLAY_NAME, esc(u.display_name || u.username)) + '>';
                        html += u.avatar_url ? '<img class="tag-search-avatar" src="' + esc(u.avatar_url) + '">' : '<div class="tag-search-avatar avatar-placeholder-sm"></div>';
                        html += '<span>' + esc(u.display_name || u.username) + ' <span style="color:var(--text-muted)">@' + esc(u.username) + '</span></span>';
                        html += '</div>';
                    });
                    if (!html) html = '<div class="social-empty" style="padding:16px">Никого не найдено</div>';
                    results.innerHTML = html;
                });
            }, 300);
        };

        results.onclick = function(e) {
            var user = e.target.closest('.tag-search-user');
            if (user) {
                onSelect({
                    user_id: user.getAttribute(SOCIAL.UID),
                    username: user.getAttribute(SOCIAL.USERNAME),
                    display_name: user.getAttribute(SOCIAL.DISPLAY_NAME)
                });
                overlay.remove();
            }
        };
    },

    _renderMentionText(text) {
        var safe = esc(text);
        return safe.replace(/@([A-Za-z0-9_]+)/g, '<a class="mention-link" href="#/u/$1">@$1</a>');
    },

    _initMentionInput(inputEl) {
        if (!inputEl || inputEl._mentionInit) return;
        inputEl._mentionInit = true;

        // Dropdown appended to body with position:fixed — immune to parent overflow/clipping
        var dropdown = document.createElement('div');
        dropdown.className = 'mention-dropdown-fixed';
        dropdown.style.display = 'none';
        document.body.appendChild(dropdown);

        var searchTimeout;

        function positionDropdown() {
            var rect = inputEl.getBoundingClientRect();
            // Show above input for comment rows (bottom of screen), below for textareas
            var isComment = !!inputEl.closest('.comment-input-row');
            if (isComment) {
                dropdown.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
                dropdown.style.top = 'auto';
            } else {
                dropdown.style.top = (rect.bottom + 4) + 'px';
                dropdown.style.bottom = 'auto';
            }
            dropdown.style.left = rect.left + 'px';
            dropdown.style.width = rect.width + 'px';
        }

        function getMentionQuery() {
            var val = inputEl.value;
            var pos = (typeof inputEl.selectionStart === 'number') ? inputEl.selectionStart : val.length;
            var before = val.slice(0, pos);
            var match = before.match(/(^|[^A-Za-z0-9_])@([A-Za-z0-9_]*)$/);
            if (!match) return null;
            return { query: match[2], start: before.lastIndexOf('@' + match[2]), len: match[2].length + 1 };
        }

        function hide() { dropdown.style.display = 'none'; dropdown.innerHTML = ''; }

        function selectUser(username) {
            var m = getMentionQuery();
            if (!m) { hide(); return; }
            var val = inputEl.value;
            inputEl.value = val.slice(0, m.start) + '@' + username + ' ' + val.slice(m.start + m.len);
            hide();
            inputEl.focus();
        }

        function renderUsers(users) {
            var myId = Social._getSupaUserId();
            var filtered = users.filter(function(u) { return u.user_id !== myId; }).slice(0, 5);
            if (!filtered.length) { hide(); return; }
            var html = '';
            filtered.forEach(function(u) {
                html += '<div class="mention-item" ' + attr(SOCIAL.USERNAME, esc(u.username)) + '>';
                html += u.avatar_url ? '<img class="mention-avatar" src="' + esc(u.avatar_url) + '">' : '<div class="mention-avatar avatar-placeholder-sm"></div>';
                html += '<div class="mention-info"><span class="mention-name">' + esc(u.display_name || u.username) + '</span><span class="mention-username">@' + esc(u.username) + '</span></div>';
                html += '</div>';
            });
            dropdown.innerHTML = html;
            positionDropdown();
            dropdown.style.display = 'block';
        }

        function doSearch() {
            // Clean up if input was removed from DOM
            if (!inputEl.isConnected) { dropdown.remove(); return; }
            clearTimeout(searchTimeout);
            var m = getMentionQuery();
            if (!m) { hide(); return; }
            searchTimeout = setTimeout(function() {
                var promise = m.query.length > 0
                    ? Social.searchUsers(m.query)
                    : Social.getRecentUsers();
                promise.then(renderUsers).catch(function() { hide(); });
            }, m.query.length > 0 ? 200 : 50);
        }

        inputEl.addEventListener('input', doSearch);
        inputEl.addEventListener('keyup', doSearch);

        // touchend for mobile — prevents blur from hiding dropdown before selection
        dropdown.addEventListener('touchend', function(e) {
            var item = e.target.closest('.mention-item');
            if (!item) return;
            e.preventDefault();
            selectUser(item.getAttribute(SOCIAL.USERNAME));
        });

        dropdown.addEventListener('click', function(e) {
            var item = e.target.closest('.mention-item');
            if (!item) return;
            selectUser(item.getAttribute(SOCIAL.USERNAME));
        });

        inputEl.addEventListener('blur', function() {
            setTimeout(hide, 300);
        });

        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') hide();
        });
    },

    _isVideo(url) {
        return /\.(mp4|mov|webm|avi|m4v)(\?|$)/i.test(url || '');
    },

    _mediaTag(url, cls, extra) {
        if (this._isVideo(url)) {
            return '<video class="' + cls + '" src="' + esc(url) + '" playsinline muted loop' + (extra || '') + '></video>';
        }
        return '<img class="' + cls + '" src="' + esc(url) + '" alt=""' + (extra || '') + '>';
    },

    _muscleGroupColor(mg) {
        var m = (mg || '').toLowerCase();
        if (m.indexOf('ног') !== -1 || m.indexOf('бедр') !== -1 || m.indexOf('квадри') !== -1) return 'rgba(76,175,80,0.25)';
        if (m.indexOf('ягодиц') !== -1) return 'rgba(233,30,99,0.25)';
        if (m.indexOf('спин') !== -1) return 'rgba(33,150,243,0.25)';
        if (m.indexOf('груд') !== -1) return 'rgba(255,152,0,0.25)';
        if (m.indexOf('плеч') !== -1 || m.indexOf('дельт') !== -1) return 'rgba(156,39,176,0.25)';
        if (m.indexOf('рук') !== -1 || m.indexOf('бицепс') !== -1 || m.indexOf('трицепс') !== -1) return 'rgba(0,188,212,0.25)';
        return 'rgba(255,255,255,0.1)';
    },

    _timeAgo(dateStr) {
        var now = Date.now();
        var then = new Date(dateStr).getTime();
        var diff = Math.floor((now - then) / 1000);
        if (diff < 60) return 'только что';
        if (diff < 3600) return Math.floor(diff / 60) + ' мин';
        if (diff < 86400) return Math.floor(diff / 3600) + ' ч';
        if (diff < 604800) return Math.floor(diff / 86400) + ' д';
        return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    },

    // ===== MESSAGING =====

    async _buildMessagesVM() {
        var results = await Promise.all([Social.getConversations(), Social.getUnreadMessageCount()]);
        return { convs: results[0], msgUnread: results[1] || 0 };
    },

    _renderMessages(vm) {
        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-messages-back">&larr;</button><h2>Сообщения</h2></div>';
        if (vm.convs.length === 0) {
            html += '<div class="messages-empty">';
            html += '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
            html += 'Нет сообщений';
            html += '</div>';
        } else {
            html += '<div class="messages-list">';
            vm.convs.forEach(function(c) {
                var p = c.other_profile;
                html += '<div class="conversation-item" ' + attr(SOCIAL.CONV, c.id) + ' ' + attr(SOCIAL.USER, p.user_id) + '>';
                if (p.avatar_url) {
                    html += '<img class="conversation-avatar" src="' + esc(p.avatar_url) + '" alt="">';
                } else {
                    html += '<div class="conversation-avatar-placeholder"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
                }
                html += '<div class="conversation-info">';
                html += '<div class="conversation-name">' + esc(p.display_name || p.username) + '</div>';
                html += '<div class="conversation-preview">' + esc(c.last_message || '') + '</div>';
                html += '</div>';
                html += '<div class="conversation-meta">';
                html += '<div class="conversation-time">' + SocialUI._timeAgo(c.last_message_at) + '</div>';
                if (c.unread_count > 0) html += '<div class="conversation-unread">' + c.unread_count + '</div>';
                html += '</div>';
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div>';
        html += this._tabBarHTML('messages');
        return html;
    },

    async renderMessages() {
        var app = document.getElementById('app');
        app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        var vm = await this._buildMessagesVM();
        this._tabBarMsgCount = vm.msgUnread;
        app.innerHTML = this._renderMessages(vm);
    },

    _chatConvId: null,

    async _buildConversationVM(conversationId, otherUserId) {
        var convId = conversationId;
        var otherProfile = null;
        if (otherUserId) {
            var conv = await Social.getOrCreateConversation(otherUserId);
            if (!conv) return { redirect: '#/messages' };
            convId = conv.id;
            otherProfile = await Social.getProfile(otherUserId);
        } else {
            var convs = await Social.getConversations();
            var conv = convs.find(function(c) { return c.id === convId; });
            if (conv) otherProfile = conv.other_profile;
        }
        var messages = await Social.getMessages(convId);
        await Social.markMessagesRead(convId);
        var myId = Social._getSupaUserId();
        return {
            convId: convId,
            messages: messages,
            myId: myId,
            name: otherProfile ? (otherProfile.display_name || otherProfile.username) : 'Чат',
            avatarUrl: otherProfile ? otherProfile.avatar_url : null
        };
    },

    _renderConversation(vm) {
        var html = '<div class="chat-screen">';
        html += '<div class="chat-header">';
        html += '<button class="social-back" id="btn-chat-back">&larr;</button>';
        if (vm.avatarUrl) html += '<img class="chat-header-avatar" src="' + esc(vm.avatarUrl) + '" alt="">';
        html += '<div class="chat-header-name">' + esc(vm.name) + '</div>';
        html += '</div>';
        html += '<div class="chat-messages" id="chat-messages">';
        html += this._renderChatMessages(vm.messages, vm.myId);
        html += '</div>';
        html += '<div class="chat-input-bar">';
        html += '<input class="chat-input" id="chat-input" type="text" placeholder="Сообщение..." autocomplete="off">';
        html += '<button class="chat-send-btn" id="btn-send-message">';
        html += '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
        html += '</button>';
        html += '</div>';
        html += '</div>';
        return html;
    },

    async renderConversation(conversationId, otherUserId) {
        var app = document.getElementById('app');
        app.innerHTML = '<div class="social-loading">Загрузка...</div>';

        var vm = await this._buildConversationVM(conversationId, otherUserId);
        if (vm.redirect) { location.hash = vm.redirect; return; }

        this._chatConvId = vm.convId;
        app.innerHTML = this._renderConversation(vm);

        // Post-render: scroll, keyboard, focus, realtime
        var chatEl = document.getElementById('chat-messages');
        if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;

        var chatScreen = app.querySelector('.chat-screen');
        if (chatScreen && window.visualViewport) {
            var onResize = function() {
                var h = window.visualViewport.height;
                var offset = window.visualViewport.offsetTop;
                chatScreen.style.height = h + 'px';
                chatScreen.style.top = offset + 'px';
                if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
            };
            window.visualViewport.addEventListener('resize', onResize);
            window.visualViewport.addEventListener('scroll', onResize);
            this._chatViewportCleanup = function() {
                window.visualViewport.removeEventListener('resize', onResize);
                window.visualViewport.removeEventListener('scroll', onResize);
            };
        }

        var inp = document.getElementById('chat-input');
        setTimeout(function() { if (inp) inp.focus(); }, 300);

        var myId = vm.myId;
        var convId = vm.convId;
        Social.subscribeToMessages(convId, function(msg) {
            if (msg.sender_id === myId) return;
            var chatEl = document.getElementById('chat-messages');
            if (!chatEl) return;
            chatEl.insertAdjacentHTML('beforeend', SocialUI._renderSingleBubble(msg, myId));
            chatEl.scrollTop = chatEl.scrollHeight;
            Social.markMessagesRead(convId);
        });
    },

    _renderChatMessages(messages, myId) {
        var html = '';
        var lastDate = '';
        messages.forEach(function(m) {
            var d = new Date(m.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
            if (d !== lastDate) {
                html += '<div class="chat-date-divider">' + d + '</div>';
                lastDate = d;
            }
            html += SocialUI._renderSingleBubble(m, myId);
        });
        return html;
    },

    _renderSingleBubble(m, myId) {
        var isMine = m.sender_id === myId;
        var time = new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        var html = '<div class="chat-bubble ' + (isMine ? 'mine' : 'theirs') + '">';
        html += esc(m.text);
        html += '<div class="chat-bubble-time">' + time + '</div>';
        html += '</div>';
        return html;
    },

    // ===== Delegated social click handlers =====
    handleClick(target) {
        // Profile edit button
        if (target.closest('#btn-profile-edit')) {
            location.hash = '#/profile/edit';
            return true;
        }

        // New checkin button
        if (target.closest('#btn-new-checkin')) {
            location.hash = '#/checkin';
            return true;
        }

        // Profile grid item click → detail
        var gridItem = target.closest('.profile-feed-item');
        if (gridItem) {
            var cid = read(gridItem, SOCIAL.CHECKIN);
            if (cid) location.hash = '#/checkin/' + cid;
            return true;
        }

        // Profile post-type tab filter
        if (target.classList.contains('profile-tab')) {
            var allTabs = document.querySelectorAll('.profile-tab');
            allTabs.forEach(function(t) { t.classList.remove('active'); });
            target.classList.add('active');
            var tab = read(target, SOCIAL.TAB);
            var allPosts = SocialUI._profileAllCheckins || [];
            var filtered;
            if (tab === 'workouts') filtered = allPosts.filter(function(c) { return !!c.workout_summary; });
            else if (tab === 'checkins') filtered = allPosts.filter(function(c) { return !c.workout_summary; });
            else filtered = allPosts;
            var gridEl = document.getElementById('profile-posts-grid');
            if (gridEl) {
                var loadBtn = gridEl.querySelector('.btn-load-more');
                gridEl.innerHTML = filtered.length ? SocialUI._renderProfileFeed(filtered) : '<div class="social-empty">Нет публикаций</div>';
                if (loadBtn) gridEl.appendChild(loadBtn);
            }
            return true;
        }

        // Profile save
        if (target.closest('#btn-profile-save')) {
            ProfileManager.saveProfile();
            return true;
        }

        // Profile back
        if (target.closest('#btn-profile-back')) {
            location.hash = '#/profile';
            return true;
        }

        // Avatar file input
        if (target.closest('#avatar-file-input')) {
            // handled by change event below
            return false;
        }

        // Athlete toggle
        if (target.id === 'edit-is-athlete') {
            var fields = document.getElementById('edit-athlete-fields');
            if (fields) fields.style.display = target.checked ? '' : 'none';
            return true;
        }

        // Follow/unfollow
        {var btn = target.closest('#btn-follow');
        if (btn) {
            var userId = read(btn, SOCIAL.USER);
            if (!userId) return true;
            btn.disabled = true;
            if (btn.classList.contains('following')) {
                Social.unfollow(userId).then(function() {
                    btn.classList.remove('following');
                    btn.textContent = 'Подписаться';
                    btn.disabled = false;
                }).catch(function(e) { btn.disabled = false; alert('Ошибка: ' + e.message); });
            } else {
                Social.follow(userId).then(function(ok) {
                    if (ok) {
                        btn.classList.add('following');
                        btn.textContent = 'Отписаться';
                    }
                    btn.disabled = false;
                }).catch(function(e) { btn.disabled = false; alert('Ошибка: ' + e.message); });
            }
            return true;
        }}

        // Follow (small btn in discover)
        if (target.classList.contains('btn-follow-sm')) {
            var userId = read(target, SOCIAL.USER);
            if (!userId) return true;
            target.disabled = true;
            Social.follow(userId).then(function(ok) {
                if (ok) {
                    target.textContent = 'Подписан';
                    target.classList.add('followed');
                } else {
                    target.disabled = false;
                }
            }).catch(function(e) { target.disabled = false; alert('Ошибка: ' + e.message); });
            return true;
        }

        // Discover navigation
        if (target.closest('#btn-discover') || target.closest('#btn-discover-empty')) {
            location.hash = '#/discover';
            return true;
        }

        // Discover back
        if (target.closest('#btn-discover-back')) {
            location.hash = '#/feed';
            return true;
        }

        // Follow list back
        if (target.closest('#btn-followlist-back')) {
            history.back();
            return true;
        }

        // Discover search
        if (target.closest('#btn-discover-search')) {
            var query = (document.getElementById('discover-search-input').value || '').trim();
            if (!query) return true;
            var resultsEl = document.getElementById('discover-results');
            if (resultsEl) resultsEl.innerHTML = '<div class="social-loading">Поиск...</div>';
            Promise.all([Social.searchUsers(query), Social.getMyFollowingIds()]).then(function(r) {
                if (resultsEl) resultsEl.innerHTML = SocialUI._renderUserList(r[0], Social._getSupaUserId(), r[1]);
            });
            return true;
        }

        // Discover user click → profile
        var discoverUser = target.closest('.discover-user');
        if (discoverUser && !target.classList.contains('btn-follow-sm')) {
            var userId = discoverUser.querySelector('.btn-follow-sm');
            if (userId) {
                var uid = read(userId, SOCIAL.USER);
                var username = discoverUser.querySelector('.discover-user-username');
                if (username) {
                    location.hash = '#/u/' + username.textContent.replace('@', '');
                }
            }
            return true;
        }

        // Notifications button
        if (target.closest('#btn-notifications')) {
            location.hash = '#/notifications';
            return true;
        }

        // Messages button (feed header)
        if (target.closest('#btn-messages')) {
            location.hash = '#/messages';
            return true;
        }

        // Messages back
        if (target.closest('#btn-messages-back')) {
            history.back();
            return true;
        }

        // Chat back
        if (target.closest('#btn-chat-back')) {
            Social.unsubscribeMessages();
            if (SocialUI._chatViewportCleanup) { SocialUI._chatViewportCleanup(); SocialUI._chatViewportCleanup = null; }
            history.back();
            return true;
        }

        // Conversation item click
        var convItem = target.closest('.conversation-item');
        if (convItem) {
            var userId = read(convItem, SOCIAL.USER);
            if (userId) location.hash = '#/messages/' + userId;
            return true;
        }

        // Send message
        if (target.closest('#btn-send-message')) {
            var inp = document.getElementById('chat-input');
            var text = inp ? inp.value.trim() : '';
            if (!text || !SocialUI._chatConvId) return true;
            inp.value = '';
            // Optimistic render
            var chatEl = document.getElementById('chat-messages');
            if (chatEl) {
                var time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                chatEl.insertAdjacentHTML('beforeend', '<div class="chat-bubble mine">' + text + '<div class="chat-bubble-time">' + time + '</div></div>');
                chatEl.scrollTop = chatEl.scrollHeight;
            }
            Social.sendMessage(SocialUI._chatConvId, text).catch(function() {});
            return true;
        }

        // DM button on other user's profile
        {var dmBtn = target.closest('#btn-dm');
        if (dmBtn) {
            var userId = read(dmBtn, SOCIAL.USER);
            if (userId) location.hash = '#/messages/' + userId;
            return true;
        }}

        // Notification back
        if (target.closest('#btn-notif-back')) {
            history.back();
            return true;
        }

        // Like button (feed cards and detail)
        var likeBtn = target.closest('.like-btn');
        if (likeBtn) {
            var checkinId = read(likeBtn, SOCIAL.CHECKIN);
            if (!checkinId) return true;
            // Optimistic UI
            var wasActive = likeBtn.classList.contains('active');
            likeBtn.classList.toggle('active');
            var countEl = likeBtn.querySelector('.like-count');
            var currentCount = parseInt(countEl.textContent) || 0;
            countEl.textContent = wasActive ? (currentCount > 1 ? currentCount - 1 : '') : (currentCount + 1);
            // API call
            Social.toggleLike(checkinId).catch(function() {
                // Rollback on error
                likeBtn.classList.toggle('active');
                countEl.textContent = currentCount > 0 ? currentCount : '';
            });
            return true;
        }

        // Comment icon button → scroll to or navigate to comments
        var commentBtnIcon = target.closest('.comment-btn-icon');
        if (commentBtnIcon) {
            var checkinId = read(commentBtnIcon, SOCIAL.CHECKIN);
            var commentInput = document.getElementById('comment-input');
            if (commentInput) {
                commentInput.focus();
            } else if (checkinId) {
                location.hash = '#/checkin/' + checkinId;
            }
            return true;
        }

        // Comment author profile link
        var profileLink = target.closest('.comment-profile-link');
        if (profileLink && !target.closest('.comment-reply-btn') && !target.closest('.comment-like-btn')) {
            var username = read(profileLink, SOCIAL.USERNAME);
            if (username) location.hash = '#/u/' + username;
            return true;
        }

        // Reply to comment
        var replyBtn = target.closest('.comment-reply-btn');
        if (replyBtn) {
            var username = read(replyBtn, SOCIAL.USERNAME);
            var commentId = read(replyBtn, SOCIAL.COMMENT_ID);
            var input = document.getElementById('comment-input');
            if (input && username) {
                SocialUI._replyToCommentId = commentId || null;
                input.value = '@' + username + ' ';
                input.focus();
                // Show reply indicator
                var indicator = document.getElementById('reply-indicator');
                var nameEl = document.getElementById('reply-indicator-name');
                if (indicator && nameEl) {
                    nameEl.textContent = username;
                    indicator.style.display = 'flex';
                }
            }
            return true;
        }

        // Cancel reply
        if (target.closest('#btn-reply-cancel')) {
            SocialUI._replyToCommentId = null;
            var indicator = document.getElementById('reply-indicator');
            if (indicator) indicator.style.display = 'none';
            var input = document.getElementById('comment-input');
            if (input) { input.value = ''; input.focus(); }
            return true;
        }

        // Comment like
        var commentLikeBtn = target.closest('.comment-like-btn');
        if (commentLikeBtn) {
            var commentId = read(commentLikeBtn, SOCIAL.COMMENT);
            if (!commentId) return true;
            var wasActive = commentLikeBtn.classList.contains('active');
            commentLikeBtn.classList.toggle('active');
            var countEl = commentLikeBtn.querySelector('.comment-like-count');
            var cur = parseInt(countEl.textContent) || 0;
            countEl.textContent = wasActive ? (cur > 1 ? cur - 1 : '') : (cur + 1);
            Social.toggleCommentLike(commentId).catch(function() {
                commentLikeBtn.classList.toggle('active');
                countEl.textContent = cur > 0 ? cur : '';
            });
            return true;
        }

        // Tag user button in checkin form
        if (target.closest('#btn-tag-user')) {
            if (!ProfileManager.checkinTaggedUsers) ProfileManager.checkinTaggedUsers = [];
            SocialUI.renderTagSearch(function(user) {
                // Check if already tagged
                var already = ProfileManager.checkinTaggedUsers.some(function(u) { return u.user_id === user.user_id; });
                if (already) return;
                ProfileManager.checkinTaggedUsers.push(user);
                var container = document.getElementById('checkin-tagged-users');
                if (container) {
                    var tag = document.createElement('span');
                    tag.className = 'tagged-user-chip';
                    tag.setAttribute(SOCIAL.UID, user.user_id);
                    tag.innerHTML = '@' + esc(user.username) + ' <button class="tagged-user-remove">&times;</button>';
                    container.appendChild(tag);
                }
            });
            return true;
        }

        // Remove tagged user chip
        var removeTag = target.closest('.tagged-user-remove');
        if (removeTag) {
            var chip = removeTag.closest('.tagged-user-chip');
            if (chip && ProfileManager.checkinTaggedUsers) {
                ProfileManager.checkinTaggedUsers = ProfileManager.checkinTaggedUsers.filter(function(u) { return u.user_id !== read(chip, SOCIAL.UID); });
                chip.remove();
            }
            return true;
        }

        // Checkin card click → detail (with double-tap detection)
        var checkinCard = target.closest('.checkin-card');
        if (checkinCard && !checkinCard.classList.contains('checkin-full') && !target.closest('.like-btn') && !target.closest('.comment-btn-icon')) {
            var checkinId = read(checkinCard, SOCIAL.CHECKIN);
            if (!checkinId) return true;

            // Double-tap detection
            var now = Date.now();
            var lastTap = checkinCard._lastTap || 0;
            checkinCard._lastTap = now;

            if (now - lastTap < 300) {
                // Double tap → like + animation
                clearTimeout(checkinCard._tapTimer);
                var likeBtnInCard = checkinCard.querySelector('.like-btn');
                if (likeBtnInCard && !likeBtnInCard.classList.contains('active')) {
                    likeBtnInCard.click();
                }
                // Show heart animation
                var anim = document.createElement('div');
                anim.className = 'double-tap-heart';
                anim.innerHTML = SocialUI._likeIconSVG;
                checkinCard.style.position = 'relative';
                checkinCard.appendChild(anim);
                setTimeout(function() { anim.remove(); }, 900);
                return true;
            }

            // Single tap → navigate after delay
            checkinCard._tapTimer = setTimeout(function() {
                location.hash = '#/checkin/' + checkinId;
            }, 300);
            return true;
        }

        // Checkin back
        if (target.closest('#btn-checkin-back')) {
            location.hash = '#/profile';
            return true;
        }

        // Checkin detail back
        if (target.closest('#btn-checkin-detail-back')) {
            history.back();
            return true;
        }

        // Delete checkin
        {var delBtn = target.closest('#btn-delete-checkin');
        if (delBtn) {
            var cid = read(delBtn, SOCIAL.CHECKIN);
            if (cid && confirm('Удалить этот чекин?')) {
                Social.deleteCheckin(cid).then(function() {
                    location.hash = '#/profile';
                }).catch(function(err) {
                    alert('Ошибка: ' + err.message);
                });
            }
            return true;
        }}

        // Checkin submit
        if (target.closest('#btn-checkin-submit')) {
            ProfileManager.submitCheckin();
            return true;
        }

        // Checkin photo input trigger
        if (target.closest('.checkin-add-photo')) {
            // Let label handle file input click
            return false;
        }

        // Send comment
        {var commentBtn = target.closest('#btn-send-comment');
        if (commentBtn) {
            var checkinId = read(commentBtn, SOCIAL.CHECKIN);
            var input = document.getElementById('comment-input');
            var text = input ? input.value.trim() : '';
            if (!text || !checkinId) return true;
            commentBtn.disabled = true;
            var parentId = SocialUI._replyToCommentId || null;
            SocialUI._replyToCommentId = null;
            Social.addComment(checkinId, text, parentId).then(function() {
                SocialUI.renderCheckinDetail(checkinId);
            }).catch(function() { commentBtn.disabled = false; });
            return true;
        }}

        // Delete comment
        var deleteCommentBtn = target.closest('.comment-delete');
        if (deleteCommentBtn) {
            var commentId = read(deleteCommentBtn, SOCIAL.COMMENT);
            if (commentId && confirm('Удалить комментарий?')) {
                Social.deleteComment(commentId).then(function() {
                    // Find parent checkin and refresh
                    var sendBtn = document.getElementById('btn-send-comment');
                    if (sendBtn) SocialUI.renderCheckinDetail(read(sendBtn, SOCIAL.CHECKIN));
                });
            }
            return true;
        }

        // Load more (feed)
        if (target.closest('#btn-load-more-feed')) {
            target.disabled = true;
            target.textContent = 'Загрузка...';
            Social.getFeed(SocialUI._feedCursor).then(function(more) {
                SocialUI._feedCursor = more.length >= 20 ? more[more.length - 1].created_at : null;
                var ids = more.map(function(c) { return c.id; });
                return Promise.all([Promise.resolve(more), Social.getLikesForCheckins(ids), Social.getTagsForCheckins(ids)]);
            }).then(function(results) {
                var more = results[0], likes = results[1], tags = results[2];
                var btn = document.getElementById('btn-load-more-feed');
                if (btn) {
                    btn.insertAdjacentHTML('beforebegin', SocialUI._renderCheckinCards(more, likes, tags));
                    if (!SocialUI._feedCursor) btn.remove();
                    else { btn.disabled = false; btn.textContent = 'Загрузить ещё'; }
                }
            });
            return true;
        }

        // Load more (profile)
        {var loadMoreBtn = target.closest('#btn-load-more-profile');
        if (loadMoreBtn) {
            var userId = read(loadMoreBtn, SOCIAL.USER);
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Загрузка...';
            Social.getUserCheckins(userId, SocialUI._profileCheckinsCursor).then(function(more) {
                SocialUI._profileCheckinsCursor = more.length >= 20 ? more[more.length - 1].created_at : null;
                SocialUI._profileAllCheckins = (SocialUI._profileAllCheckins || []).concat(more);
                var gridEl = document.querySelector('.profile-grid');
                if (gridEl) {
                    gridEl.insertAdjacentHTML('beforeend', SocialUI._renderProfileFeed(more, true));
                }
                if (!SocialUI._profileCheckinsCursor) loadMoreBtn.remove();
                else { loadMoreBtn.disabled = false; loadMoreBtn.textContent = 'Загрузить ещё'; }
            });
            return true;
        }}

        // Checkin author click → profile
        var checkinAuthor = target.closest('.checkin-author[' + SOCIAL.USERNAME + ']');
        if (checkinAuthor) {
            var username = read(checkinAuthor, SOCIAL.USERNAME);
            if (username) location.hash = '#/u/' + username;
            return true;
        }

        return false;
    }
};
