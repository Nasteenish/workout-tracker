/* ===== Avatar Cropper ===== */
import { lockBodyScroll, unlockBodyScroll } from './scroll-lock.js';

export const AvatarCropper = {
    _resolve: null,
    _img: null,
    _canvas: null,
    _ctx: null,
    _scale: 1,
    _minScale: 1,
    _offsetX: 0,
    _offsetY: 0,
    _circleRadius: 0,
    _canvasCssW: 0,
    _canvasCssH: 0,
    // Touch state
    _dragging: false,
    _dragStartX: 0,
    _dragStartY: 0,
    _startOffsetX: 0,
    _startOffsetY: 0,
    _lastDist: 0,
    _lastCenter: null,

    open(file) {
        var self = this;
        return new Promise(function(resolve) {
            self._resolve = resolve;
            var url = URL.createObjectURL(file);
            var img = new Image();
            img.onload = function() {
                URL.revokeObjectURL(url);
                self._img = img;
                self._build();
            };
            img.onerror = function() {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
        });
    },

    _build() {
        // Create overlay
        var el = document.createElement('div');
        el.className = 'cropper-overlay';
        el.id = 'avatar-cropper';
        el.innerHTML =
            '<div class="cropper-header">' +
                '<button class="cropper-cancel" id="cropper-cancel">Отмена</button>' +
                '<span class="cropper-title">Обрезка фото</span>' +
                '<button class="cropper-done" id="cropper-done">Готово</button>' +
            '</div>' +
            '<div class="cropper-viewport" id="cropper-viewport">' +
                '<canvas id="cropper-canvas"></canvas>' +
            '</div>' +
            '<div class="cropper-hint">Перетащите и масштабируйте</div>';
        document.body.appendChild(el);
        lockBodyScroll();

        // Setup canvas
        this._canvas = document.getElementById('cropper-canvas');
        this._ctx = this._canvas.getContext('2d');
        this._setupCanvas();

        // Calculate initial scale
        var circleD = this._circleRadius * 2;
        var scaleX = circleD / this._img.naturalWidth;
        var scaleY = circleD / this._img.naturalHeight;
        this._minScale = Math.max(scaleX, scaleY);
        this._scale = this._minScale;
        this._offsetX = 0;
        this._offsetY = 0;
        this._render();

        // Bind events
        this._bindEvents();
    },

    _setupCanvas() {
        var viewport = document.getElementById('cropper-viewport');
        var rect = viewport.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        this._canvas.width = rect.width * dpr;
        this._canvas.height = rect.height * dpr;
        this._ctx.scale(dpr, dpr);
        this._canvasCssW = rect.width;
        this._canvasCssH = rect.height;
        this._circleRadius = (Math.min(rect.width, rect.height) - 48) / 2;
    },

    _render() {
        var ctx = this._ctx;
        var w = this._canvasCssW;
        var h = this._canvasCssH;
        var r = this._circleRadius;
        var cx = w / 2;
        var cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw image
        var imgW = this._img.naturalWidth * this._scale;
        var imgH = this._img.naturalHeight * this._scale;
        var imgX = cx - imgW / 2 + this._offsetX;
        var imgY = cy - imgH / 2 + this._offsetY;
        ctx.drawImage(this._img, imgX, imgY, imgW, imgH);

        // 2. Dark overlay with circular cutout (evenodd)
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
        ctx.fill('evenodd');

        // 3. Circle border
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    },

    _clampOffset() {
        var imgW = this._img.naturalWidth * this._scale;
        var imgH = this._img.naturalHeight * this._scale;
        var r = this._circleRadius;
        var maxX = imgW / 2 - r;
        var maxY = imgH / 2 - r;
        if (maxX < 0) maxX = 0;
        if (maxY < 0) maxY = 0;
        this._offsetX = Math.max(-maxX, Math.min(maxX, this._offsetX));
        this._offsetY = Math.max(-maxY, Math.min(maxY, this._offsetY));
    },

    _getTouchDist(touches) {
        var dx = touches[0].clientX - touches[1].clientX;
        var dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    _getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    },

    _bindEvents() {
        var self = this;
        var canvas = this._canvas;

        // Touch handlers
        this._onTS = function(e) {
            e.preventDefault();
            var touches = e.touches;
            if (touches.length === 1) {
                self._dragging = true;
                self._dragStartX = touches[0].clientX;
                self._dragStartY = touches[0].clientY;
                self._startOffsetX = self._offsetX;
                self._startOffsetY = self._offsetY;
            } else if (touches.length === 2) {
                self._dragging = false;
                self._lastDist = self._getTouchDist(touches);
                self._lastCenter = self._getTouchCenter(touches);
                self._startOffsetX = self._offsetX;
                self._startOffsetY = self._offsetY;
            }
        };

        this._onTM = function(e) {
            e.preventDefault();
            var touches = e.touches;
            if (touches.length === 1 && self._dragging) {
                var dx = touches[0].clientX - self._dragStartX;
                var dy = touches[0].clientY - self._dragStartY;
                self._offsetX = self._startOffsetX + dx;
                self._offsetY = self._startOffsetY + dy;
                self._clampOffset();
                self._render();
            } else if (touches.length === 2) {
                var dist = self._getTouchDist(touches);
                var center = self._getTouchCenter(touches);
                var ratio = dist / self._lastDist;
                var newScale = self._scale * ratio;
                newScale = Math.max(self._minScale, Math.min(newScale, self._minScale * 5));

                // Zoom towards pinch center
                var cx = self._canvasCssW / 2;
                var cy = self._canvasCssH / 2;
                var rect = canvas.getBoundingClientRect();
                var pcx = center.x - rect.left - cx;
                var pcy = center.y - rect.top - cy;
                self._offsetX = self._startOffsetX + (center.x - self._lastCenter.x) - pcx * (newScale / self._scale - 1);
                self._offsetY = self._startOffsetY + (center.y - self._lastCenter.y) - pcy * (newScale / self._scale - 1);
                self._scale = newScale;
                self._clampOffset();
                self._render();

                self._lastDist = dist;
                self._lastCenter = center;
                self._startOffsetX = self._offsetX;
                self._startOffsetY = self._offsetY;
            }
        };

        this._onTE = function(e) {
            if (e.touches.length === 0) {
                self._dragging = false;
            } else if (e.touches.length === 1) {
                self._dragging = true;
                self._dragStartX = e.touches[0].clientX;
                self._dragStartY = e.touches[0].clientY;
                self._startOffsetX = self._offsetX;
                self._startOffsetY = self._offsetY;
            }
        };

        canvas.addEventListener('touchstart', this._onTS, { passive: false });
        canvas.addEventListener('touchmove', this._onTM, { passive: false });
        canvas.addEventListener('touchend', this._onTE, { passive: false });

        // Mouse support for desktop testing
        var mouseDown = false;
        this._onMD = function(e) {
            mouseDown = true;
            self._dragging = true;
            self._dragStartX = e.clientX;
            self._dragStartY = e.clientY;
            self._startOffsetX = self._offsetX;
            self._startOffsetY = self._offsetY;
        };
        this._onMM = function(e) {
            if (!mouseDown) return;
            var dx = e.clientX - self._dragStartX;
            var dy = e.clientY - self._dragStartY;
            self._offsetX = self._startOffsetX + dx;
            self._offsetY = self._startOffsetY + dy;
            self._clampOffset();
            self._render();
        };
        this._onMU = function() { mouseDown = false; self._dragging = false; };
        this._onWheel = function(e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? 0.9 : 1.1;
            var newScale = Math.max(self._minScale, Math.min(self._scale * delta, self._minScale * 5));
            self._scale = newScale;
            self._clampOffset();
            self._render();
        };
        canvas.addEventListener('mousedown', this._onMD);
        canvas.addEventListener('mousemove', this._onMM);
        canvas.addEventListener('mouseup', this._onMU);
        canvas.addEventListener('wheel', this._onWheel, { passive: false });

        // Buttons
        this._onCancel = function() { self._cancel(); };
        this._onDone = function() { self._confirm(); };
        document.getElementById('cropper-cancel').addEventListener('click', this._onCancel);
        document.getElementById('cropper-done').addEventListener('click', this._onDone);
    },

    _crop() {
        var output = document.createElement('canvas');
        output.width = 400;
        output.height = 400;
        var ctx = output.getContext('2d');

        var cx = this._canvasCssW / 2;
        var cy = this._canvasCssH / 2;
        var r = this._circleRadius;

        var imgX = cx - (this._img.naturalWidth * this._scale) / 2 + this._offsetX;
        var imgY = cy - (this._img.naturalHeight * this._scale) / 2 + this._offsetY;

        var srcX = (cx - r - imgX) / this._scale;
        var srcY = (cy - r - imgY) / this._scale;
        var srcSize = (2 * r) / this._scale;

        ctx.drawImage(this._img, srcX, srcY, srcSize, srcSize, 0, 0, 400, 400);

        return new Promise(function(resolve) {
            output.toBlob(function(blob) { resolve(blob); }, 'image/jpeg', 0.9);
        });
    },

    _confirm() {
        var self = this;
        var btn = document.getElementById('cropper-done');
        if (btn) { btn.disabled = true; btn.textContent = '...'; }
        this._crop().then(function(blob) {
            self._close();
            self._resolve(blob);
        });
    },

    _cancel() {
        this._close();
        this._resolve(null);
    },

    _close() {
        var el = document.getElementById('avatar-cropper');
        if (el) el.remove();
        unlockBodyScroll();
        this._img = null;
        this._canvas = null;
        this._ctx = null;
    }
};
