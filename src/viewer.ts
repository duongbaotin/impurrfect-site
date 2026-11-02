// @ts-nocheck
// Custom single-image viewer registered on the Alpine instance from src/alpine.ts.
// Thumbnails live outside the viewer subtree (and the view is replaced on every
// ClientRouter navigation), so the listener is attached once at module scope and
// relays to whichever viewer instance is currently mounted.

let activeViewer = null;

const handleOpenViewer = (event) => {
  activeViewer?.openViewer(event.detail);
};

if (typeof window !== 'undefined') {
  window.addEventListener('open-viewer', handleOpenViewer);
}

export function registerImageViewer(Alpine) {
  Alpine.data('imageViewer', () => ({
    isOpen: false,
    currentImage: null,
    showHint: true,

    scale: 1,
    minScale: 1,
    maxScale: 3,

    translateX: 0,
    translateY: 0,

    dragStartY: 0,
    dragStartX: 0,
    isDragging: false,
    dragOffsetY: 0,

    initialPinchDistance: 0,
    initialScale: 1,

    lastTapTime: 0,
    hintTimer: null,
    _onBeforeSwap: null,

    init() {
      activeViewer = this;
      // ClientRouter replaces the body; drop the stale instance reference so
      // events between swaps can never hit a destroyed component.
      this._onBeforeSwap = () => {
        if (activeViewer === this) activeViewer = null;
      };
      document.addEventListener('astro:before-swap', this._onBeforeSwap);
    },

    destroy() {
      if (activeViewer === this) activeViewer = null;
      if (this._onBeforeSwap) {
        document.removeEventListener('astro:before-swap', this._onBeforeSwap);
      }
      if (this.hintTimer) clearTimeout(this.hintTimer);
      this.resetBackdrop();
      if (this.isOpen) document.body.style.overflow = '';
    },

    openViewer(image) {
      if (!image?.url) return;
      this.currentImage = image;
      this.isOpen = true;
      this.resetState();
      this.showHint = true;

      if (this.hintTimer) clearTimeout(this.hintTimer);
      this.hintTimer = setTimeout(() => {
        this.showHint = false;
      }, 3000);

      this.$nextTick(() => {
        const closeBtn = this.$el.querySelector('button');
        if (closeBtn) closeBtn.focus();
      });
    },

    close() {
      this.isOpen = false;
      this.currentImage = null;
      if (this.hintTimer) {
        clearTimeout(this.hintTimer);
        this.hintTimer = null;
      }
      this.resetState();
      this.resetBackdrop();
    },

    resetState() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.dragOffsetY = 0;
      this.isDragging = false;
      this.resetBackdrop();
    },

    resetBackdrop() {
      const backdrop = this.$el?.querySelector?.('[data-viewer-backdrop]');
      if (backdrop) backdrop.style.opacity = '';
    },

    get imageStyle() {
      // Only apply the drag offset while at rest scale; when zoomed, the same
      // finger movement pans the image instead.
      const offsetY = this.scale <= 1 ? this.dragOffsetY : 0;
      const transform = `translate(${this.translateX}px, ${this.translateY + offsetY}px) scale(${this.scale})`;
      // Let the image track the finger 1:1, then ease back on release.
      const transition = this.isDragging ? ' transition: none;' : '';
      return `transform: ${transform};${transition}`;
    },

    onTouchStart(e) {
      if (e.touches.length === 2) {
        this.initialPinchDistance = this.getPinchDistance(e.touches);
        this.initialScale = this.scale;
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const timeSinceLastTap = now - this.lastTapTime;

        if (timeSinceLastTap < 300) {
          this.toggleZoom(e);
          this.lastTapTime = 0;
        } else {
          this.dragStartY = e.touches[0].clientY;
          this.dragStartX = e.touches[0].clientX;
          this.isDragging = true;
          this.lastTapTime = now;
        }
      }
    },

    onTouchMove(e) {
      if (e.touches.length === 2) {
        const currentDistance = this.getPinchDistance(e.touches);
        const ratio = currentDistance / this.initialPinchDistance;
        this.scale = Math.min(Math.max(this.initialScale * ratio, this.minScale), this.maxScale);

        if (this.scale <= 1) {
          this.translateX = 0;
          this.translateY = 0;
          this.dragOffsetY = 0;
        }
      } else if (e.touches.length === 1 && this.isDragging) {
        const deltaY = e.touches[0].clientY - this.dragStartY;
        const deltaX = e.touches[0].clientX - this.dragStartX;

        if (this.scale > 1) {
          e.preventDefault();
          this.translateX += deltaX;
          this.translateY += deltaY;
          this.dragStartX = e.touches[0].clientX;
          this.dragStartY = e.touches[0].clientY;
        } else {
          // Drag-down-to-close only; dragging up should not peel the image away.
          this.dragOffsetY = Math.max(0, deltaY);

          const opacity = Math.max(0, 1 - this.dragOffsetY / 300);
          const backdrop = this.$el.querySelector('[data-viewer-backdrop]');
          if (backdrop) {
            backdrop.style.opacity = String(opacity);
          }
        }
      }
    },

    onTouchEnd() {
      if (this.isDragging) {
        if (this.scale <= 1 && this.dragOffsetY > 100) {
          this.close();
        } else {
          this.dragOffsetY = 0;
          this.resetBackdrop();
        }
      }

      this.isDragging = false;
    },

    onWheel(e) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.scale = Math.min(Math.max(this.scale + delta, this.minScale), this.maxScale);

      if (this.scale <= 1) {
        this.translateX = 0;
        this.translateY = 0;
        this.dragOffsetY = 0;
      }
    },

    toggleZoom(e) {
      if (this.scale === 1) {
        this.scale = 2;

        const rect = this.$refs.image.getBoundingClientRect();
        const cx = e.clientX ?? rect.left + rect.width / 2;
        const cy = e.clientY ?? rect.top + rect.height / 2;
        const x = cx - rect.left - rect.width / 2;
        const y = cy - rect.top - rect.height / 2;
        this.translateX = -x;
        this.translateY = -y;
      } else {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
      }

      this.dragOffsetY = 0;
      this.resetBackdrop();
    },

    getPinchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    },
  }));
}
