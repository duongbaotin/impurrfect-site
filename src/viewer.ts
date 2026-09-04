// @ts-nocheck
// Custom single-image viewer registered on the Alpine instance from src/alpine.ts.
// Listens on window (thumbnails live outside the viewer subtree, so a local
// $el listener never receives their events).

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

    init() {
      window.addEventListener('open-viewer', (e) => {
        this.openViewer(e.detail);
      });
    },

    openViewer(image) {
      if (!image?.url) return;
      this.currentImage = image;
      this.isOpen = true;
      this.resetState();
      this.showHint = true;

      setTimeout(() => {
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
      this.resetState();
    },

    resetState() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.dragOffsetY = 0;
      this.isDragging = false;
    },

    get imageStyle() {
      return `transform: translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale});`;
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
          this.dragOffsetY = deltaY;

          const opacity = Math.max(0, 1 - Math.abs(deltaY) / 300);
          const backdrop = this.$el.querySelector('[data-viewer-backdrop]');
          if (backdrop) {
            backdrop.style.opacity = String(opacity);
          }
        }
      }
    },

    onTouchEnd() {
      if (this.isDragging) {
        if (this.scale <= 1 && Math.abs(this.dragOffsetY) > 100) {
          this.close();
        } else {
          this.dragOffsetY = 0;
          const backdrop = this.$el.querySelector('[data-viewer-backdrop]');
          if (backdrop) {
            backdrop.style.opacity = '';
          }
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
      }
    },

    toggleZoom(e) {
      if (this.scale === 1) {
        this.scale = 2;

        const rect = this.$refs.image.getBoundingClientRect();
        const cx = (e.clientX ?? rect.left + rect.width / 2);
        const cy = (e.clientY ?? rect.top + rect.height / 2);
        const x = cx - rect.left - rect.width / 2;
        const y = cy - rect.top - rect.height / 2;
        this.translateX = -x;
        this.translateY = -y;
      } else {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
      }
    },

    getPinchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    },
  }));
}
