// social.js — Supabase API for social features: profiles, check-ins, follows, reactions, comments

const Social = {

    // ===== HELPERS =====

    _getSupaUserId() {
        var localId = Storage.getCurrentUserId();
        if (!localId) return null;
        return localStorage.getItem('wt_supa_' + localId) || null;
    },

    _hasSupaAuth() {
        return !!this._getSupaUserId();
    },

    // ===== PROFILE =====

    async getProfile(userId) {
        if (!supa) return null;
        var result = await supa.from('profiles').select('*').eq('user_id', userId).single();
        if (result.error) return null;
        return result.data;
    },

    async getProfileByUsername(username) {
        if (!supa) return null;
        var result = await supa.from('profiles').select('*').eq('username', username).single();
        if (result.error) return null;
        return result.data;
    },

    async getMyProfile() {
        var userId = this._getSupaUserId();
        if (!userId) return null;
        return this.getProfile(userId);
    },

    async upsertProfile(data) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        data.user_id = userId;
        data.updated_at = new Date().toISOString();
        var result = await supa.from('profiles').upsert(data, { onConflict: 'user_id' }).select().single();
        if (result.error) throw new Error(result.error.message);
        return result.data;
    },

    async uploadAvatar(file) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        var ext = file.name ? file.name.split('.').pop() : 'jpg';
        var path = userId + '/avatar.' + ext;
        var result = await supa.storage.from('avatars').upload(path, file, { upsert: true });
        if (result.error) throw new Error(result.error.message);
        var urlResult = supa.storage.from('avatars').getPublicUrl(path);
        return urlResult.data.publicUrl + '?t=' + Date.now();
    },

    // ===== FOLLOWS =====

    async follow(targetUserId) {
        if (!supa) return false;
        var userId = this._getSupaUserId();
        if (!userId) return false;
        var result = await supa.from('follows').insert({ follower_id: userId, following_id: targetUserId });
        if (result.error) throw new Error(result.error.message);
        this.createNotification(targetUserId, 'follow', null, null);
        return true;
    },

    async unfollow(targetUserId) {
        if (!supa) return false;
        var userId = this._getSupaUserId();
        if (!userId) return false;
        var result = await supa.from('follows').delete().eq('follower_id', userId).eq('following_id', targetUserId);
        if (result.error) throw new Error(result.error.message);
        return true;
    },

    async isFollowing(targetUserId) {
        if (!supa) return false;
        var userId = this._getSupaUserId();
        if (!userId) return false;
        var result = await supa.from('follows').select('follower_id').eq('follower_id', userId).eq('following_id', targetUserId).maybeSingle();
        return !!result.data;
    },

    async getMyFollowingIds() {
        if (!supa) return [];
        var userId = this._getSupaUserId();
        if (!userId) return [];
        var result = await supa.from('follows').select('following_id').eq('follower_id', userId);
        if (result.error || !result.data) return [];
        return result.data.map(function(r) { return r.following_id; });
    },

    async getFollowCounts(userId) {
        if (!supa) return { followers: 0, following: 0 };
        var r1 = await supa.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
        var r2 = await supa.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
        return { followers: r1.count || 0, following: r2.count || 0 };
    },

    async getFollowers(userId) {
        if (!supa) return [];
        var result = await supa.from('follows').select('follower_id, profiles!follows_follower_id_fkey(user_id, username, display_name, avatar_url)').eq('following_id', userId);
        if (result.error) return [];
        return result.data.map(function(r) { return r.profiles; });
    },

    async getFollowing(userId) {
        if (!supa) return [];
        var result = await supa.from('follows').select('following_id, profiles!follows_following_id_fkey(user_id, username, display_name, avatar_url)').eq('follower_id', userId);
        if (result.error) return [];
        return result.data.map(function(r) { return r.profiles; });
    },

    // ===== CHECK-INS =====

    _resizeImage(file, maxDim) {
        return new Promise(function(resolve) {
            var img = new Image();
            img.onload = function() {
                URL.revokeObjectURL(img.src);
                var w = img.width, h = img.height;
                var ratio = Math.min(maxDim / w, maxDim / h, 1);
                var nw = Math.round(w * ratio);
                var nh = Math.round(h * ratio);
                var c = document.createElement('canvas');
                c.width = nw; c.height = nh;
                c.getContext('2d').drawImage(img, 0, 0, nw, nh);
                c.toBlob(function(blob) { resolve(blob || file); }, 'image/jpeg', 0.92);
            };
            img.onerror = function() { resolve(file); };
            img.src = URL.createObjectURL(file);
        });
    },

    async uploadCheckinPhoto(file) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        var isVideo = file.type && file.type.startsWith('video/');
        var uploadFile = file;
        var ext = 'jpg';
        var contentType = 'image/jpeg';
        if (isVideo) {
            // Video: upload as-is, limit 50MB
            if (file.size > 50 * 1024 * 1024) throw new Error('Видео до 50 МБ');
            ext = file.name.split('.').pop() || 'mp4';
            contentType = file.type || 'video/mp4';
        } else {
            // Image: resize to max 1800px
            uploadFile = await this._resizeImage(file, 1800);
        }
        var name = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        var path = userId + '/' + name + '.' + ext;
        var result = await supa.storage.from('checkin-photos').upload(path, uploadFile, { upsert: false, contentType: contentType });
        if (result.error) throw new Error(result.error.message);
        var urlResult = supa.storage.from('checkin-photos').getPublicUrl(path);
        return urlResult.data.publicUrl;
    },

    async createCheckin(data) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        data.user_id = userId;
        var result = await supa.from('checkins').insert(data).select().single();
        if (result.error) throw new Error(result.error.message);
        return result.data;
    },

    async deleteCheckin(id) {
        if (!supa) return false;
        var result = await supa.from('checkins').delete().eq('id', id);
        if (result.error) throw new Error(result.error.message);
        return true;
    },

    async getCheckin(id) {
        if (!supa) return null;
        var result = await supa.from('checkins')
            .select('*, profiles(username, display_name, avatar_url, is_pro)')
            .eq('id', id).single();
        if (result.error) return null;
        return result.data;
    },

    async getUserCheckins(userId, cursor) {
        if (!supa) return [];
        var query = supa.from('checkins')
            .select('*, profiles(username, display_name, avatar_url, is_pro)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
        if (cursor) query = query.lt('created_at', cursor);
        var result = await query;
        if (result.error) return [];
        return result.data;
    },

    async getCheckinCounts(userId) {
        if (!supa) return { workouts: 0, checkins: 0 };
        var r1 = await supa.from('checkins').select('*', { count: 'exact', head: true })
            .eq('user_id', userId).not('workout_summary', 'is', null);
        var r2 = await supa.from('checkins').select('*', { count: 'exact', head: true })
            .eq('user_id', userId).is('workout_summary', null);
        return { workouts: r1.count || 0, checkins: r2.count || 0 };
    },

    async getFeed(cursor) {
        if (!supa) return [];
        var userId = this._getSupaUserId();
        if (!userId) return [];
        // Get who I follow
        var followResult = await supa.from('follows').select('following_id').eq('follower_id', userId);
        if (followResult.error || !followResult.data.length) return [];
        var followIds = followResult.data.map(function(f) { return f.following_id; });
        // Include own posts
        followIds.push(userId);
        var query = supa.from('checkins')
            .select('*, profiles(username, display_name, avatar_url, is_pro)')
            .in('user_id', followIds)
            .order('created_at', { ascending: false })
            .limit(20);
        if (cursor) query = query.lt('created_at', cursor);
        var result = await query;
        if (result.error) return [];
        return result.data;
    },

    // ===== LIKES (single heart reaction) =====

    async toggleLike(checkinId) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        var existing = await supa.from('reactions').select('id').eq('checkin_id', checkinId).eq('user_id', userId).maybeSingle();
        if (existing.data) {
            await supa.from('reactions').delete().eq('id', existing.data.id);
            return false; // unliked
        } else {
            var result = await supa.from('reactions').insert({ checkin_id: checkinId, user_id: userId, emoji: '❤️' });
            if (result.error) throw new Error(result.error.message);
            // Notify checkin owner
            var checkin = await supa.from('checkins').select('user_id').eq('id', checkinId).single();
            if (checkin.data && checkin.data.user_id !== userId) {
                this.createNotification(checkin.data.user_id, 'like', checkinId, null);
            }
            return true; // liked
        }
    },

    async getLikesForCheckins(checkinIds) {
        if (!supa || !checkinIds.length) return { counts: {}, myLikes: new Set() };
        var userId = this._getSupaUserId();
        var result = await supa.from('reactions').select('checkin_id, user_id').in('checkin_id', checkinIds);
        if (result.error || !result.data) return { counts: {}, myLikes: new Set() };
        var counts = {};
        var myLikes = new Set();
        result.data.forEach(function(r) {
            counts[r.checkin_id] = (counts[r.checkin_id] || 0) + 1;
            if (r.user_id === userId) myLikes.add(r.checkin_id);
        });
        return { counts: counts, myLikes: myLikes };
    },

    async getLikeCount(checkinId) {
        if (!supa) return 0;
        var result = await supa.from('reactions').select('*', { count: 'exact', head: true }).eq('checkin_id', checkinId);
        return result.count || 0;
    },

    async hasLiked(checkinId) {
        if (!supa) return false;
        var userId = this._getSupaUserId();
        if (!userId) return false;
        var result = await supa.from('reactions').select('id').eq('checkin_id', checkinId).eq('user_id', userId).maybeSingle();
        return !!result.data;
    },

    // Legacy — kept for backward compat
    async toggleReaction(checkinId, emoji) {
        return this.toggleLike(checkinId);
    },

    async getReactions(checkinId) {
        if (!supa) return [];
        var result = await supa.from('reactions')
            .select('*, profiles(username, display_name, avatar_url, is_pro)')
            .eq('checkin_id', checkinId);
        if (result.error) return [];
        return result.data;
    },

    // ===== PHOTO TAGS =====

    async tagUsers(checkinId, userIds) {
        if (!supa || !userIds.length) return [];
        var userId = this._getSupaUserId();
        if (!userId) return [];
        var rows = userIds.map(function(uid) {
            return { checkin_id: checkinId, tagged_user_id: uid, tagged_by: userId };
        });
        var result = await supa.from('photo_tags').insert(rows).select();
        if (result.error) throw new Error(result.error.message);
        // Notify tagged users
        var self = this;
        userIds.forEach(function(uid) {
            if (uid !== userId) self.createNotification(uid, 'tag', checkinId, null);
        });
        return result.data;
    },

    async getTagsForCheckin(checkinId) {
        if (!supa) return [];
        var result = await supa.from('photo_tags')
            .select('*, profiles:tagged_user_id(user_id, username, display_name, avatar_url)')
            .eq('checkin_id', checkinId);
        if (result.error) return [];
        return result.data;
    },

    async getTagsForCheckins(checkinIds) {
        if (!supa || !checkinIds.length) return {};
        var result = await supa.from('photo_tags')
            .select('checkin_id, tagged_user_id, profiles:tagged_user_id(username, display_name)')
            .in('checkin_id', checkinIds);
        if (result.error || !result.data) return {};
        var tags = {};
        result.data.forEach(function(t) {
            if (!tags[t.checkin_id]) tags[t.checkin_id] = [];
            tags[t.checkin_id].push(t.profiles);
        });
        return tags;
    },

    // ===== NOTIFICATIONS =====

    async createNotification(targetUserId, type, checkinId, commentId) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId || targetUserId === userId) return null;
        var data = {
            user_id: targetUserId,
            type: type,
            from_user_id: userId,
            checkin_id: checkinId || null,
            comment_id: commentId || null
        };
        var result = await supa.from('notifications').insert(data);
        // Silently ignore errors
        return result.data;
    },

    async getNotifications(limit) {
        if (!supa) return [];
        var userId = this._getSupaUserId();
        if (!userId) return [];
        // Fetch notifications without join (avoids FK issues)
        var result = await supa.from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit || 50);
        if (result.error || !result.data || !result.data.length) return [];
        // Fetch profiles for from_user_ids separately
        var fromIds = [];
        result.data.forEach(function(n) {
            if (n.from_user_id && fromIds.indexOf(n.from_user_id) === -1) fromIds.push(n.from_user_id);
        });
        var profileMap = {};
        if (fromIds.length) {
            var pResult = await supa.from('profiles')
                .select('user_id, username, display_name, avatar_url')
                .in('user_id', fromIds);
            if (pResult.data) {
                pResult.data.forEach(function(p) { profileMap[p.user_id] = p; });
            }
        }
        // Attach profiles
        result.data.forEach(function(n) {
            n.from_profile = profileMap[n.from_user_id] || null;
        });
        return result.data;
    },

    async getUnreadNotificationCount() {
        if (!supa) return 0;
        var userId = this._getSupaUserId();
        if (!userId) return 0;
        var result = await supa.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false);
        return result.count || 0;
    },

    async markNotificationsRead() {
        if (!supa) return;
        var userId = this._getSupaUserId();
        if (!userId) return;
        await supa.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    },

    // ===== COMMENTS =====

    async addComment(checkinId, text, parentId) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        var insertData = { checkin_id: checkinId, user_id: userId, text: text };
        if (parentId) insertData.parent_id = parentId;
        var result = await supa.from('comments')
            .insert(insertData)
            .select('*, profiles(username, display_name, avatar_url, is_pro)')
            .single();
        if (result.error) throw new Error(result.error.message);
        // Notify checkin owner
        var checkin = await supa.from('checkins').select('user_id').eq('id', checkinId).single();
        if (checkin.data && checkin.data.user_id !== userId) {
            this.createNotification(checkin.data.user_id, 'comment', checkinId, result.data.id);
        }
        // If reply, also notify parent comment author
        if (parentId) {
            var parent = await supa.from('comments').select('user_id').eq('id', parentId).single();
            if (parent.data && parent.data.user_id !== userId && (!checkin.data || parent.data.user_id !== checkin.data.user_id)) {
                this.createNotification(parent.data.user_id, 'comment', checkinId, result.data.id);
            }
        }
        return result.data;
    },

    async deleteComment(commentId) {
        if (!supa) return false;
        var result = await supa.from('comments').delete().eq('id', commentId);
        if (result.error) throw new Error(result.error.message);
        return true;
    },

    async getComments(checkinId) {
        if (!supa) return [];
        var result = await supa.from('comments')
            .select('*, profiles(username, display_name, avatar_url, is_pro)')
            .eq('checkin_id', checkinId)
            .order('created_at', { ascending: true });
        if (result.error) return [];
        return result.data;
    },

    // ===== COMMENT LIKES =====

    async toggleCommentLike(commentId) {
        if (!supa) return null;
        var userId = this._getSupaUserId();
        if (!userId) return null;
        var existing = await supa.from('comment_likes').select('id').eq('comment_id', commentId).eq('user_id', userId).maybeSingle();
        if (existing.data) {
            await supa.from('comment_likes').delete().eq('id', existing.data.id);
            return false;
        } else {
            await supa.from('comment_likes').insert({ comment_id: commentId, user_id: userId });
            // Notify comment author
            var comment = await supa.from('comments').select('user_id, checkin_id').eq('id', commentId).single();
            if (comment.data && comment.data.user_id !== userId) {
                this.createNotification(comment.data.user_id, 'like', comment.data.checkin_id, commentId);
            }
            return true;
        }
    },

    async getCommentLikes(commentIds) {
        if (!supa || !commentIds.length) return { counts: {}, myLikes: new Set() };
        var userId = this._getSupaUserId();
        var result = await supa.from('comment_likes').select('comment_id, user_id').in('comment_id', commentIds);
        if (result.error || !result.data) return { counts: {}, myLikes: new Set() };
        var counts = {};
        var myLikes = new Set();
        result.data.forEach(function(r) {
            counts[r.comment_id] = (counts[r.comment_id] || 0) + 1;
            if (r.user_id === userId) myLikes.add(r.comment_id);
        });
        return { counts: counts, myLikes: myLikes };
    },

    async getCommentCountsForCheckins(checkinIds) {
        if (!supa || !checkinIds.length) return {};
        var result = await supa.from('comments').select('checkin_id').in('checkin_id', checkinIds);
        if (result.error || !result.data) return {};
        var counts = {};
        result.data.forEach(function(r) {
            counts[r.checkin_id] = (counts[r.checkin_id] || 0) + 1;
        });
        return counts;
    },

    // ===== DISCOVERY =====

    async searchUsers(query) {
        if (!supa) return [];
        var result = await supa.from('profiles')
            .select('*')
            .or('username.ilike.%' + query + '%,display_name.ilike.%' + query + '%')
            .limit(20);
        if (result.error) return [];
        return result.data;
    },

    async getRecentUsers() {
        if (!supa) return [];
        var result = await supa.from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        if (result.error) return [];
        return result.data;
    },

    // ===== MESSAGING =====

    async getOrCreateConversation(otherUserId) {
        if (!supa) return null;
        var myId = this._getSupaUserId();
        if (!myId) return null;
        // Consistent ordering: smaller UUID = user1
        var u1 = myId < otherUserId ? myId : otherUserId;
        var u2 = myId < otherUserId ? otherUserId : myId;
        // Try find existing
        var r = await supa.from('conversations')
            .select('*')
            .eq('user1_id', u1).eq('user2_id', u2).single();
        if (r.data) return r.data;
        // Create new
        var r2 = await supa.from('conversations')
            .insert({ user1_id: u1, user2_id: u2 })
            .select().single();
        if (r2.error) throw new Error(r2.error.message);
        return r2.data;
    },

    async getConversations() {
        if (!supa) return [];
        var myId = this._getSupaUserId();
        if (!myId) return [];
        var r = await supa.from('conversations')
            .select('*')
            .or('user1_id.eq.' + myId + ',user2_id.eq.' + myId)
            .order('last_message_at', { ascending: false });
        if (r.error) return [];
        var convs = r.data || [];
        // Fetch profiles for other users
        var otherIds = convs.map(function(c) { return c.user1_id === myId ? c.user2_id : c.user1_id; });
        var uniqueIds = otherIds.filter(function(id, i) { return otherIds.indexOf(id) === i; });
        var profileMap = {};
        if (uniqueIds.length) {
            var pr = await supa.from('profiles').select('*').in('user_id', uniqueIds);
            if (pr.data) pr.data.forEach(function(p) { profileMap[p.user_id] = p; });
        }
        // Get unread counts per conversation
        var unreadR = await supa.from('messages')
            .select('conversation_id', { count: 'exact' })
            .eq('read', false)
            .neq('sender_id', myId)
            .in('conversation_id', convs.map(function(c) { return c.id; }));
        // Count per conversation manually
        var unreadMap = {};
        if (unreadR.data) {
            unreadR.data.forEach(function(m) {
                unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
            });
        }
        convs.forEach(function(c) {
            var otherId = c.user1_id === myId ? c.user2_id : c.user1_id;
            c.other_profile = profileMap[otherId] || { username: '?', display_name: '?' };
            c.unread_count = unreadMap[c.id] || 0;
        });
        return convs;
    },

    async getMessages(conversationId, before) {
        if (!supa) return [];
        var q = supa.from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(30);
        if (before) q = q.lt('created_at', before);
        var r = await q;
        if (r.error) return [];
        return (r.data || []).reverse();
    },

    async sendMessage(conversationId, text) {
        if (!supa) return null;
        var myId = this._getSupaUserId();
        if (!myId) return null;
        var r = await supa.from('messages')
            .insert({ conversation_id: conversationId, sender_id: myId, text: text })
            .select().single();
        if (r.error) throw new Error(r.error.message);
        // Update conversation last_message
        await supa.from('conversations')
            .update({ last_message: text, last_message_at: new Date().toISOString() })
            .eq('id', conversationId);
        return r.data;
    },

    async markMessagesRead(conversationId) {
        if (!supa) return;
        var myId = this._getSupaUserId();
        if (!myId) return;
        await supa.from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', myId)
            .eq('read', false);
    },

    async getUnreadMessageCount() {
        if (!supa) return 0;
        var myId = this._getSupaUserId();
        if (!myId) return 0;
        var r = await supa.from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('read', false)
            .neq('sender_id', myId);
        return r.count || 0;
    },

    _messageChannel: null,

    subscribeToMessages(conversationId, callback) {
        this.unsubscribeMessages();
        if (!supa) return;
        this._messageChannel = supa.channel('messages_' + conversationId)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + conversationId },
                function(payload) { callback(payload.new); }
            ).subscribe();
    },

    unsubscribeMessages() {
        if (this._messageChannel) {
            supa.removeChannel(this._messageChannel);
            this._messageChannel = null;
        }
    },

    // Global subscription: notifies about any new message in user's conversations
    _globalMsgChannel: null,

    subscribeToGlobalMessages(callback) {
        this.unsubscribeGlobalMessages();
        if (!supa) return;
        var myId = this._getSupaUserId();
        if (!myId) return;
        this._globalMsgChannel = supa.channel('global_msgs_' + myId)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                function(payload) {
                    var msg = payload.new;
                    if (msg.sender_id !== myId) {
                        callback(msg);
                    }
                }
            ).subscribe();
    },

    unsubscribeGlobalMessages() {
        if (this._globalMsgChannel) {
            supa.removeChannel(this._globalMsgChannel);
            this._globalMsgChannel = null;
        }
    }
};
