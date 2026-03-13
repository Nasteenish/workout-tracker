// social-ui.js — UI rendering for social features: profile, feed, check-in, discover

const SocialUI = {
    _feedCursor: null,
    _profileCheckinsCursor: null,

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
    _tabBarHTML(activeTab) {
        var tabs = [
            { id: 'workouts', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="7" width="3" height="10" rx="1"/><rect x="5" y="4" width="3" height="16" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><rect x="16" y="4" width="3" height="16" rx="1"/><rect x="20" y="7" width="3" height="10" rx="1"/></svg>', label: 'Трени', hash: '' },
            { id: 'feed', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>', label: 'Лента', hash: '#/feed' },
            { id: 'profile', icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: 'Профиль', hash: '#/profile' }
        ];
        var html = '<nav class="tab-bar">';
        tabs.forEach(function(tab) {
            var cls = tab.id === activeTab ? ' active' : '';
            html += '<a class="tab-item' + cls + '" href="' + (tab.hash || '#/') + '">';
            html += '<span class="tab-icon">' + tab.icon + '</span>';
            html += '<span class="tab-label">' + tab.label + '</span>';
            html += '</a>';
        });
        html += '</nav>';
        return html;
    },

    // ===== PROFILE VIEW =====
    async renderProfile(userId, useCache) {
        var app = document.getElementById('app');
        var myId = Social._getSupaUserId();
        var isOwn = !userId || userId === myId;
        var targetId = isOwn ? myId : userId;
        if (!targetId) { location.hash = '#/login'; return; }

        // Instant restore from cache (back-swipe, own profile only)
        if (useCache && isOwn && this._profileCache) {
            app.innerHTML = this._profileCache;
            return;
        }

        // Show subtle loading indicator without clearing existing content
        if (!app.querySelector('.social-screen')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }

        var results = await Promise.all([
            Social.getProfile(targetId),
            Social.getFollowCounts(targetId),
            !isOwn ? Social.isFollowing(targetId) : Promise.resolve(false),
            Social.getUserCheckins(targetId),
            Social.getCheckinCounts(targetId)
        ]);
        var profile = results[0];
        var counts = results[1];
        var isFollowing = results[2];
        var checkins = results[3];
        var postCounts = results[4];

        // Fetch likes and preload photos
        var ids = checkins.map(function(c) { return c.id; });
        var extraResults = await Promise.all([
            Social.getLikesForCheckins(ids),
            this._preloadPhotos(checkins)
        ]);
        var likes = extraResults[0];

        if (!profile && isOwn) {
            location.hash = '#/profile/edit';
            return;
        }
        if (!profile) {
            app.innerHTML = '<div class="social-screen"><div class="social-empty">Профиль не найден</div></div>';
            return;
        }
        this._profileCheckinsCursor = checkins.length >= 20 ? checkins[checkins.length - 1].created_at : null;

        var html = '<div class="social-screen">';
        html += '<div class="profile-header">';
        html += '<div class="profile-avatar-wrap">';
        html += profile.avatar_url
            ? '<img class="profile-avatar" src="' + profile.avatar_url + '" alt="">'
            : '<div class="profile-avatar profile-avatar-placeholder"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>';
        html += '</div>';
        html += '<div class="profile-info">';
        html += '<h2 class="profile-name">' + (profile.display_name || profile.username) + (profile.is_pro ? ' <span class="pro-badge">IFBB PRO</span>' : '') + '</h2>';
        html += '<div class="profile-username">@' + profile.username + '</div>';
        if (profile.is_athlete && profile.category) {
            html += '<div class="profile-badge">' + profile.category + '</div>';
        }
        if (profile.is_athlete && profile.coach) {
            html += '<div class="profile-coach">Тренер: ' + profile.coach + '</div>';
        }
        if (profile.phase) {
            html += '<span class="profile-phase">' + profile.phase + '</span>';
        }
        html += '</div>';
        html += '</div>';

        // Stats row
        html += '<div class="profile-stats">';
        html += '<a class="stat stat-link" href="#/followers/' + targetId + '"><span class="stat-num">' + (counts.followers || 0) + '</span><span class="stat-label">подписчиков</span></a>';
        html += '<a class="stat stat-link" href="#/following/' + targetId + '"><span class="stat-num">' + (counts.following || 0) + '</span><span class="stat-label">подписок</span></a>';
        html += '<div class="stat"><span class="stat-num">' + (postCounts.workouts || 0) + '</span><span class="stat-label">тренировок</span></div>';
        html += '<div class="stat"><span class="stat-num">' + (postCounts.checkins || 0) + '</span><span class="stat-label">чекинов</span></div>';
        html += '</div>';

        // Action buttons
        html += '<div class="profile-actions">';
        if (isOwn) {
            html += '<button class="btn-profile-edit" id="btn-profile-edit">Редактировать</button>';
            html += '<button class="btn-create-checkin" id="btn-new-checkin">Новый чекин</button>';
        } else {
            html += '<button class="btn-follow ' + (isFollowing ? 'following' : '') + '" id="btn-follow" data-user="' + targetId + '">';
            html += isFollowing ? 'Отписаться' : 'Подписаться';
            html += '</button>';
        }
        html += '</div>';

        // Bio
        if (profile.bio) {
            html += '<div class="profile-bio">' + profile.bio + '</div>';
        }

        // Post type tabs + grid
        html += '<div class="profile-post-tabs">';
        html += '<button class="profile-tab active" data-tab="all">Все</button>';
        html += '<button class="profile-tab" data-tab="workouts">Тренировки</button>';
        html += '<button class="profile-tab" data-tab="checkins">Чекины</button>';
        html += '</div>';
        html += '<div class="profile-checkins" id="profile-posts-grid">';
        if (checkins.length === 0) {
            html += '<div class="social-empty">Пока нет публикаций</div>';
        } else {
            html += this._renderProfileGrid(checkins);
        }
        if (this._profileCheckinsCursor) {
            html += '<button class="btn-load-more" id="btn-load-more-profile" data-user="' + targetId + '">Загрузить ещё</button>';
        }
        html += '</div>';
        this._profileAllCheckins = checkins;
        html += '</div>';

        // Tab bar
        html += this._tabBarHTML('profile');

        app.innerHTML = html;
        if (isOwn) this._profileCache = html;
    },

    // ===== PROFILE EDIT =====
    async renderProfileEdit() {
        var app = document.getElementById('app');
        var myId = Social._getSupaUserId();
        if (!myId) { location.hash = '#/login'; return; }

        if (!app.querySelector('.edit-fields')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }
        var profile = await Social.getMyProfile() || {};

        // Default username from local user
        if (!profile.username) {
            var currentUser = Storage.getCurrentUser();
            profile.username = currentUser ? (currentUser.login || currentUser.name || '') : '';
        }

        var maleCategories = ["Men's Physique", "Men's Classic Physique", "Men's 212 Bodybuilding", "Men's Bodybuilding"];
        var femaleCategories = ["Women's Fit Model", "Women's Bikini", "Women's Wellness", "Women's Figure", "Women's Fitness", "Women's Physique", "Women's Bodybuilding"];
        var categories = profile.gender === 'male' ? maleCategories : profile.gender === 'female' ? femaleCategories : maleCategories.concat(femaleCategories);
        var phases = ['Off-season', 'Bulk', 'Cut', 'Prep', 'Show Week'];

        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-profile-back">&larr;</button><h2>Редактирование</h2><button class="social-save" id="btn-profile-save">Сохранить</button></div>';

        // Avatar
        html += '<div class="edit-avatar-section">';
        html += profile.avatar_url
            ? '<img class="edit-avatar" id="edit-avatar-preview" src="' + profile.avatar_url + '" alt="">'
            : '<div class="edit-avatar edit-avatar-placeholder" id="edit-avatar-preview"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><span class="edit-avatar-hint">Фото</span></div>';
        html += '<label class="edit-avatar-btn" for="avatar-file-input">Изменить фото</label>';
        html += '<input type="file" id="avatar-file-input" accept="image/*" style="display:none">';
        html += '</div>';

        // Fields
        html += '<div class="edit-fields">';
        html += '<div class="edit-field"><label>Имя</label><input type="text" id="edit-display-name" value="' + (profile.display_name || '') + '" placeholder="Ваше имя"></div>';
        html += '<div class="edit-field"><label>Username</label><input type="text" id="edit-username" value="' + (profile.username || '') + '" placeholder="username" autocapitalize="none"></div>';
        html += '<div class="edit-field"><label>Bio</label><textarea id="edit-bio" rows="3" placeholder="О себе">' + (profile.bio || '') + '</textarea></div>';

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
        categories.forEach(function(c) {
            html += '<option value="' + c + '"' + (profile.category === c ? ' selected' : '') + '>' + c + '</option>';
        });
        html += '</select></div>';
        html += '<div class="edit-field"><label>Тренер</label><input type="text" id="edit-coach" value="' + (profile.coach || '') + '" placeholder="Имя тренера"></div>';
        html += '<div class="edit-field"><label>Фаза</label><select id="edit-phase"><option value="">—</option>';
        phases.forEach(function(p) {
            html += '<option value="' + p + '"' + (profile.phase === p ? ' selected' : '') + '>' + p + '</option>';
        });
        html += '</select></div>';
        html += '</div>'; // athlete-fields

        html += '</div>'; // edit-fields
        html += '</div>'; // social-screen

        app.innerHTML = html;
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
                html += '<div class="share-muscle-tag" style="background:' + mgColor + '">' + mg + '</div>';
            }

            // Workout title — only if different from muscle group
            if (prefillWorkout.title && prefillWorkout.title !== mg) {
                html += '<div class="share-workout-title">' + prefillWorkout.title + '</div>';
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
                html += '<div class="share-gym-tag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + prefillWorkout.gym_name + '</div>';
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
            App._checkinPhotos = [];
            App._checkinTaggedUsers = [];
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
        html += '<label class="checkin-add-photo" for="checkin-photo-input">+ Фото</label>';
        html += '<input type="file" id="checkin-photo-input" accept="image/*" multiple style="display:none">';
        html += '<div class="checkin-photo-hint">До 3 фото</div>';
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
    async renderFeed(useCache) {
        var app = document.getElementById('app');

        // Instant restore from cache (back-swipe)
        if (useCache && this._feedCache) {
            app.innerHTML = this._feedCache;
            return;
        }

        if (!app.querySelector('.social-screen')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>' + this._tabBarHTML('feed');
        }

        var feedResults = await Promise.all([Social.getFeed(), Social.getMyFollowingIds()]);
        var checkins = feedResults[0];
        var followingIds = feedResults[1];
        this._feedCursor = checkins.length >= 20 ? checkins[checkins.length - 1].created_at : null;

        // Fetch likes, tags, photos in parallel
        var ids = checkins.map(function(c) { return c.id; });
        var extra = await Promise.all([
            Social.getLikesForCheckins(ids),
            Social.getTagsForCheckins(ids),
            this._preloadPhotos(checkins),
            Social.getUnreadNotificationCount(),
            Social.getCommentCountsForCheckins(ids)
        ]);
        var likes = extra[0];
        var tags = extra[1];
        var unreadCount = extra[3];
        var commentCounts = extra[4];

        var html = '<div class="social-screen">';
        html += '<div class="social-header"><h2>Лента</h2>';
        // Notification bell
        html += '<button class="social-notif-btn" id="btn-notifications">';
        html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
        if (unreadCount > 0) html += '<span class="notif-badge">' + unreadCount + '</span>';
        html += '</button>';
        html += '<button class="social-discover-btn" id="btn-discover"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button></div>';

        if (checkins.length === 0) {
            html += '<div class="social-empty">';
            html += '<div class="social-empty-icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg></div>';
            if (followingIds.length > 0) {
                html += '<p>Пока нет чекинов</p>';
                html += '<p class="social-empty-hint">Ваши подписки ещё не публиковали чекины</p>';
            } else {
                html += '<p>Лента пуста</p>';
                html += '<p class="social-empty-hint">Подпишитесь на атлетов чтобы видеть их чекины</p>';
                html += '<button class="btn-primary" id="btn-discover-empty">Найти атлетов</button>';
            }
            html += '</div>';
        } else {
            html += this._renderCheckinCards(checkins, likes, tags, commentCounts);
            if (this._feedCursor) {
                html += '<button class="btn-load-more" id="btn-load-more-feed">Загрузить ещё</button>';
            }
        }

        html += '</div>';
        html += this._tabBarHTML('feed');

        app.innerHTML = html;
        this._feedCache = html;
    },

    // ===== CHECKIN DETAIL =====
    async renderCheckinDetail(checkinId) {
        var app = document.getElementById('app');
        if (!app.querySelector('.checkin-full')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }

        var results = await Promise.all([
            Social.getCheckin(checkinId),
            Social.getReactions(checkinId),
            Social.getComments(checkinId),
            Social.getTagsForCheckin(checkinId)
        ]);
        var checkin = results[0];
        if (checkin) await this._preloadPhotos([checkin]);
        var reactions = results[1];
        var comments = results[2];
        var photoTags = results[3];
        if (!checkin) {
            app.innerHTML = '<div class="social-screen"><div class="social-empty">Чекин не найден</div></div>';
            return;
        }

        // Fetch comment likes
        var commentIds = comments.map(function(c) { return c.id; });
        var commentLikes = commentIds.length ? await Social.getCommentLikes(commentIds) : { counts: {}, myLikes: new Set() };

        var myId = Social._getSupaUserId();
        var myReaction = reactions.find(function(r) { return r.user_id === myId; });

        var isOwn = checkin.user_id === myId;

        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-checkin-detail-back">&larr;</button><h2>Check-in</h2>';
        if (isOwn) html += '<button class="checkin-delete-btn" id="btn-delete-checkin" data-checkin="' + checkin.id + '"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>';
        html += '</div>';

        // Full card
        html += this._renderFullCheckin(checkin, reactions, myReaction, photoTags);

        // Photo tags list (detail view)
        if (photoTags && photoTags.length) {
            html += '<div class="photo-tags-detail">';
            html += '<span class="photo-tags-label">Отмечены: </span>';
            html += photoTags.map(function(t) {
                var p = t.profiles || t;
                return '<a class="photo-tag-link" href="#/u/' + (p.username || '') + '">@' + (p.username || p.display_name || '?') + '</a>';
            }).join(', ');
            html += '</div>';
        }

        // Comments — group into threads
        var topLevel = comments.filter(function(c) { return !c.parent_id; });
        var replies = {};
        comments.forEach(function(c) {
            if (c.parent_id) {
                if (!replies[c.parent_id]) replies[c.parent_id] = [];
                replies[c.parent_id].push(c);
            }
        });

        function renderComment(c, isReply) {
            var isMine = c.user_id === myId;
            var authorName = c.profiles ? (c.profiles.display_name || c.profiles.username) : '?';
            var authorUsername = c.profiles ? c.profiles.username : '';
            var clCount = commentLikes.counts[c.id] || 0;
            var clLiked = commentLikes.myLikes.has ? commentLikes.myLikes.has(c.id) : false;
            var h = '<div class="comment-item' + (isReply ? ' comment-reply' : '') + '">';
            h += '<div class="comment-avatar">';
            h += c.profiles && c.profiles.avatar_url
                ? '<img src="' + c.profiles.avatar_url + '" alt="">'
                : '<div class="avatar-placeholder-sm"></div>';
            h += '</div>';
            h += '<div class="comment-body">';
            h += '<span class="comment-author">' + authorName + '</span> ';
            h += '<span class="comment-text">' + SocialUI._renderMentionText(c.text) + '</span>';
            h += '<div class="comment-meta">';
            h += '<span class="comment-time">' + SocialUI._timeAgo(c.created_at) + '</span>';
            if (!isMine) h += '<button class="comment-reply-btn" data-username="' + authorUsername + '" data-commentid="' + c.id + '">Ответить</button>';
            h += '<button class="comment-like-btn' + (clLiked ? ' active' : '') + '" data-comment="' + c.id + '">';
            h += '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            h += '<span class="comment-like-count">' + (clCount > 0 ? clCount : '') + '</span>';
            h += '</button>';
            h += '</div>';
            h += '</div>';
            if (isMine) h += '<button class="comment-delete" data-comment="' + c.id + '">&times;</button>';
            h += '</div>';
            return h;
        }

        html += '<div class="checkin-comments">';
        html += '<h3>Комментарии (' + comments.length + ')</h3>';
        topLevel.forEach(function(c) {
            html += renderComment(c, false);
            var reps = replies[c.id];
            if (reps && reps.length) {
                html += '<div class="comment-replies">';
                reps.forEach(function(r) { html += renderComment(r, true); });
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
        html += '<button class="comment-send" id="btn-send-comment" data-checkin="' + checkinId + '">Отправить</button>';
        html += '</div>';
        html += '</div>'; // comments

        html += '</div>'; // social-screen

        app.innerHTML = html;

        // Init @mention autocomplete on comment input
        var commentInput = document.getElementById('comment-input');
        if (commentInput) this._initMentionInput(commentInput);
    },

    // ===== DISCOVER =====
    async renderDiscover(useCache) {
        var app = document.getElementById('app');

        // Instant restore from cache (back-swipe)
        if (useCache && this._discoverCache) {
            app.innerHTML = this._discoverCache;
            return;
        }

        if (!app.querySelector('.discover-results')) {
            app.innerHTML = '<div class="social-loading">Загрузка...</div>';
        }

        var myId = Social._getSupaUserId();
        var results = await Promise.all([Social.getRecentUsers(), Social.getMyFollowingIds()]);
        var users = results[0];
        var followingIds = results[1];

        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-discover-back">&larr;</button><h2>Поиск</h2></div>';
        html += '<div class="discover-search"><input type="text" id="discover-search-input" placeholder="Поиск по имени..."><button class="discover-search-btn" id="btn-discover-search"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button></div>';

        html += '<div class="discover-results" id="discover-results">';
        html += this._renderUserList(users, myId, followingIds);
        html += '</div>';

        html += '</div>';

        app.innerHTML = html;
        this._discoverCache = html;

        // Enter to search
        var searchInput = document.getElementById('discover-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') document.getElementById('btn-discover-search').click();
            });
        }
    },

    // ===== RENDER HELPERS =====

    _renderProfileGrid(checkins, noWrap) {
        var html = noWrap ? '' : '<div class="profile-grid">';
        checkins.forEach(function(c) {
            var isWorkout = !!c.workout_summary;
            html += '<div class="profile-grid-item" data-checkin="' + c.id + '">';
            if (c.photos && c.photos.length > 0) {
                html += '<img class="profile-grid-thumb" src="' + c.photos[0] + '" alt="" loading="lazy">';
            } else if (isWorkout) {
                var ws = c.workout_summary;
                var mg = ws.muscle_group || ws.title || '';
                var mgClr = SocialUI._muscleGroupColor(mg);
                html += '<div class="profile-grid-placeholder" style="background:' + mgClr + '">';
                html += '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="7" width="3" height="10" rx="1"/><rect x="5" y="4" width="3" height="16" rx="1"/><rect x="16" y="4" width="3" height="16" rx="1"/><rect x="20" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
                if (mg) html += '<span>' + mg + '</span>';
                html += '</div>';
            } else {
                html += '<div class="profile-grid-placeholder">';
                html += '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L9 17"/></svg>';
                if (c.weight) html += '<span>' + c.weight + ' кг</span>';
                html += '</div>';
            }
            html += '<span class="grid-type-badge">' + (isWorkout ? '\uD83C\uDFCB\uFE0F' : '\uD83D\uDCF8') + '</span>';
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
            html += '<div class="checkin-card" data-checkin="' + c.id + '">';
            // Author row
            html += '<div class="checkin-author">';
            html += c.profiles && c.profiles.avatar_url
                ? '<img class="checkin-author-avatar" src="' + c.profiles.avatar_url + '" alt="">'
                : '<div class="checkin-author-avatar avatar-placeholder-sm"></div>';
            html += '<div class="checkin-author-info">';
            html += '<span class="checkin-author-name">' + (c.profiles ? (c.profiles.display_name || c.profiles.username) : '?') + (c.profiles && c.profiles.is_pro ? ' <span class="pro-badge">IFBB PRO</span>' : '') + '</span>';
            html += '<span class="checkin-time">' + SocialUI._timeAgo(c.created_at) + '</span>';
            html += '</div>';
            html += '</div>';

            // Photos
            if (c.photos && c.photos.length > 0) {
                html += '<div class="checkin-photos' + (c.photos.length > 1 ? ' multi' : '') + '">';
                c.photos.forEach(function(url) {
                    html += '<img class="checkin-photo" src="' + url + '" alt="">';
                });
                // Photo tags badge
                var cTags = tagData[c.id];
                if (cTags && cTags.length) {
                    html += '<div class="photo-tag-badge">с ' + cTags.map(function(t) { return '@' + (t.username || t.display_name); }).join(', ') + '</div>';
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
                html += '<span class="checkin-muscle-tag" style="background:' + mgClr + '">' + wsLabel + '</span>';
                var wStats = [];
                if (ws.duration_sec) wStats.push(Math.round(ws.duration_sec / 60) + ' мин');
                if (ws.exercises) wStats.push(ws.exercises.length + ' упр.');
                if (ws.total_sets) wStats.push(ws.total_sets + ' подх.');
                if (wStats.length) html += '<span class="checkin-workout-stats">' + wStats.join(' · ') + '</span>';
                if (ws.gym_name) html += '<span class="checkin-gym-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + ws.gym_name + '</span>';
                if (ws.exercises && ws.exercises.length) {
                    html += '<div class="checkin-workout-exercises">';
                    ws.exercises.slice(0, 6).forEach(function(e) {
                        html += '<div class="workout-ex-item">';
                        html += '<div class="workout-ex-name">' + e.name + '</div>';
                        if (e.logged && e.logged.length) {
                            e.logged.forEach(function(s, idx) {
                                var parts = [];
                                if (s.weight) parts.push(s.weight + ' ' + (s.unit || 'kg'));
                                if (s.reps) parts.push('x ' + s.reps);
                                var line = parts.join(' ') || '—';
                                if (s.equipment) line += ' <span class="workout-eq">' + s.equipment + '</span>';
                                html += '<div class="workout-set-line">' + (idx + 1) + '. ' + line + '</div>';
                            });
                        } else if (e.sets) {
                            html += '<div class="workout-set-line">' + e.sets + ' подх.</div>';
                        }
                        html += '</div>';
                    });
                    if (ws.exercises.length > 6) html += '<div class="workout-set-line">+' + (ws.exercises.length - 6) + ' ещё</div>';
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
            html += '<button class="like-btn' + (isLiked ? ' active' : '') + '" data-checkin="' + c.id + '">';
            html += SocialUI._likeIconSVG;
            html += '<span class="like-count">' + (likeCount > 0 ? likeCount : '') + '</span>';
            html += '</button>';
            var cc = commentCountData[c.id] || 0;
            html += '<button class="comment-btn-icon" data-checkin="' + c.id + '">';
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
        html += '<div class="checkin-author" data-username="' + (c.profiles ? c.profiles.username : '') + '">';
        html += c.profiles && c.profiles.avatar_url
            ? '<img class="checkin-author-avatar" src="' + c.profiles.avatar_url + '" alt="">'
            : '<div class="checkin-author-avatar avatar-placeholder-sm"></div>';
        html += '<div class="checkin-author-info">';
        html += '<span class="checkin-author-name">' + (c.profiles ? (c.profiles.display_name || c.profiles.username) : '?') + (c.profiles && c.profiles.is_pro ? ' <span class="pro-badge">IFBB PRO</span>' : '') + '</span>';
        html += '<span class="checkin-time">' + SocialUI._timeAgo(c.created_at) + '</span>';
        html += '</div>';
        html += '</div>';

        // Photos
        if (c.photos && c.photos.length > 0) {
            html += '<div class="checkin-photos' + (c.photos.length > 1 ? ' multi' : '') + '">';
            c.photos.forEach(function(url) {
                html += '<img class="checkin-photo" src="' + url + '" alt="">';
            });
            // Photo tags badge
            if (photoTags && photoTags.length) {
                html += '<div class="photo-tag-badge">с ' + photoTags.map(function(t) {
                    var p = t.profiles || t;
                    return '@' + (p.username || p.display_name || '?');
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
            html += '<span class="checkin-muscle-tag" style="background:' + dMgClr + '">' + dLabel + '</span>';
            if (ws.duration_sec) html += ' ' + Math.round(ws.duration_sec / 60) + ' мин';
            if (ws.gym_name) html += '<div class="checkin-gym-tag" style="margin-top:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + ws.gym_name + '</div>';
            if (ws.exercises && ws.exercises.length) {
                html += '<div class="checkin-workout-exercises">';
                ws.exercises.forEach(function(e) {
                    html += '<div class="workout-ex-item">';
                    html += '<div class="workout-ex-name">' + e.name + '</div>';
                    if (e.logged && e.logged.length) {
                        e.logged.forEach(function(s, idx) {
                            var parts = [];
                            if (s.weight != null && s.weight !== '') parts.push(s.weight + ' ' + (s.unit || 'kg'));
                            if (s.reps) parts.push('x ' + s.reps);
                            var line = parts.join(' ') || '—';
                            if (s.equipment) line += ' <span class="workout-eq">' + s.equipment + '</span>';
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
        html += '<button class="like-btn' + (isLiked ? ' active' : '') + '" data-checkin="' + c.id + '">';
        html += SocialUI._likeIconSVG;
        html += '<span class="like-count">' + (likeCount > 0 ? likeCount : '') + '</span>';
        html += '</button>';
        html += '<button class="comment-btn-icon" data-checkin="' + c.id + '">';
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
                ? '<img class="discover-user-avatar" src="' + u.avatar_url + '" alt="">'
                : '<div class="discover-user-avatar avatar-placeholder-sm"></div>';
            html += '<div class="discover-user-info">';
            html += '<div class="discover-user-name">' + (u.display_name || u.username) + '</div>';
            html += '<div class="discover-user-username">@' + u.username + '</div>';
            if (u.is_athlete && u.category) html += '<div class="discover-user-badge">' + u.category + '</div>';
            html += '</div>';
            if (isFollowed) {
                html += '<button class="btn-follow-sm followed" data-user="' + u.user_id + '" disabled>Подписан</button>';
            } else {
                html += '<button class="btn-follow-sm" data-user="' + u.user_id + '">Подписаться</button>';
            }
            html += '</div>';
        });
        return html;
    },

    // ===== FOLLOWERS / FOLLOWING LIST =====
    async renderFollowList(userId, type) {
        var app = document.getElementById('app');
        app.innerHTML = '<div class="social-loading">Загрузка...</div>';

        var isFollowers = type === 'followers';
        var title = isFollowers ? 'Подписчики' : 'Подписки';
        var results = await Promise.all([
            isFollowers ? Social.getFollowers(userId) : Social.getFollowing(userId),
            Social.getMyFollowingIds()
        ]);
        var users = results[0];
        var followingIds = results[1];
        var myId = Social._getSupaUserId();

        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-followlist-back">&larr;</button><h2>' + title + '</h2></div>';
        html += '<div class="discover-results">';
        html += this._renderUserList(users, myId, followingIds);
        html += '</div>';
        html += '</div>';

        app.innerHTML = html;
    },

    // ===== NOTIFICATIONS PAGE =====
    async renderNotifications() {
        var app = document.getElementById('app');
        app.innerHTML = '<div class="social-loading">Загрузка...</div>';

        var notifications = await Social.getNotifications(50);
        // Mark all as read
        Social.markNotificationsRead();

        var html = '<div class="social-screen">';
        html += '<div class="social-header"><button class="social-back" id="btn-notif-back">&larr;</button><h2>Уведомления</h2></div>';

        if (!notifications.length) {
            html += '<div class="social-empty"><p>Нет уведомлений</p></div>';
        } else {
            html += '<div class="notif-list">';
            notifications.forEach(function(n) {
                var p = n.from_profile;
                var name = p ? (p.display_name || p.username || '?') : '?';
                var avatar = p && p.avatar_url
                    ? '<img class="notif-avatar" src="' + p.avatar_url + '" alt="">'
                    : '<div class="notif-avatar avatar-placeholder-sm"></div>';
                var text = '';
                var link = '';
                if (n.type === 'like') { text = ' поставил(а) лайк'; link = n.checkin_id ? '#/checkin/' + n.checkin_id : ''; }
                else if (n.type === 'comment') { text = ' прокомментировал(а)'; link = n.checkin_id ? '#/checkin/' + n.checkin_id : ''; }
                else if (n.type === 'follow') { text = ' подписался(-ась) на вас'; link = p ? '#/u/' + p.username : ''; }
                else if (n.type === 'tag') { text = ' отметил(а) вас на фото'; link = n.checkin_id ? '#/checkin/' + n.checkin_id : ''; }

                html += '<a class="notif-item' + (n.read ? '' : ' unread') + '" href="' + link + '">';
                html += avatar;
                html += '<div class="notif-body">';
                html += '<span class="notif-name">' + name + '</span>';
                html += '<span class="notif-text">' + text + '</span>';
                html += '<div class="notif-time">' + SocialUI._timeAgo(n.created_at) + '</div>';
                html += '</div>';
                html += '</a>';
            });
            html += '</div>';
        }

        html += '</div>';
        app.innerHTML = html;
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
                        html += '<div class="tag-search-user" data-uid="' + u.user_id + '" data-username="' + u.username + '" data-name="' + (u.display_name || u.username) + '">';
                        html += u.avatar_url ? '<img class="tag-search-avatar" src="' + u.avatar_url + '">' : '<div class="tag-search-avatar avatar-placeholder-sm"></div>';
                        html += '<span>' + (u.display_name || u.username) + ' <span style="color:var(--text-muted)">@' + u.username + '</span></span>';
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
                    user_id: user.dataset.uid,
                    username: user.dataset.username,
                    display_name: user.dataset.name
                });
                overlay.remove();
            }
        };
    },

    _renderMentionText(text) {
        var safe = text.replace(/</g, '&lt;');
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
                html += '<div class="mention-item" data-username="' + u.username + '">';
                html += u.avatar_url ? '<img class="mention-avatar" src="' + u.avatar_url + '">' : '<div class="mention-avatar avatar-placeholder-sm"></div>';
                html += '<div class="mention-info"><span class="mention-name">' + (u.display_name || u.username) + '</span><span class="mention-username">@' + u.username + '</span></div>';
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
            selectUser(item.dataset.username);
        });

        dropdown.addEventListener('click', function(e) {
            var item = e.target.closest('.mention-item');
            if (!item) return;
            selectUser(item.dataset.username);
        });

        inputEl.addEventListener('blur', function() {
            setTimeout(hide, 300);
        });

        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') hide();
        });
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
    }
};
