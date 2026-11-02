// @ts-nocheck
// Preview-only Alpine component shared by /menu-preview's filter bar, section
// wrappers and drink cards. Registered once from src/alpine.ts.

const THEME_KEY = 'impurrfect-menu-preview-theme';

// Preview is a single route instance; a module-level timer survives Alpine's
// method `this` binding (the event target) and is cleared on swap.
let scrollTimer = null;

export function registerMenuPreview(Alpine) {
  Alpine.data('menuPreview', () => ({
    items: [],
    moods: [],
    spirits: [],
    activeCategory: 'all',
    activeMood: null,
    activeSpirit: null,
    openDrawer: null,
    openKeys: [],
    theme: 'dark',
    _onBeforeSwap: null,

    init() {
      try {
        this.items = JSON.parse(this.$el.dataset.items || '[]');
      } catch {
        this.items = [];
      }

      try {
        this.moods = JSON.parse(this.$el.dataset.moods || '[]');
      } catch {
        this.moods = [];
      }

      try {
        this.spirits = JSON.parse(this.$el.dataset.spirits || '[]');
      } catch {
        this.spirits = [];
      }

      let stored = 'dark';
      try {
        stored = localStorage.getItem(THEME_KEY) === 'paper' ? 'paper' : 'dark';
      } catch {}
      this.setTheme(stored, false);

      // ClientRouter swaps root attributes from the next document, but clear
      // the preview shell explicitly so a failed swap cannot leak it.
      this._onBeforeSwap = () => {
        document.documentElement.removeAttribute('data-preview');
        document.documentElement.removeAttribute('data-preview-theme');
      };
      document.addEventListener('astro:before-swap', this._onBeforeSwap);
    },

    destroy() {
      if (this._onBeforeSwap) {
        document.removeEventListener('astro:before-swap', this._onBeforeSwap);
      }
      if (scrollTimer) clearTimeout(scrollTimer);
    },

    itemMatches(item) {
      // Snacks are strictly excluded whenever any drink filter (taste or spirit) is active
      if (
        (this.activeMood !== null || this.activeSpirit !== null) &&
        item.category === 'Snacks'
      ) {
        return false;
      }
      if (this.activeCategory !== 'all' && item.category !== this.activeCategory) {
        return false;
      }
      if (this.activeMood && !item.moods.includes(this.activeMood)) {
        return false;
      }
      if (this.activeSpirit && item.subcategory !== this.activeSpirit) {
        return false;
      }
      return true;
    },

    isItemVisible(key) {
      const item = this.items.find((entry) => entry.key === key);
      return item ? this.itemMatches(item) : true;
    },

    get visibleItems() {
      return this.items.filter((item) => this.itemMatches(item));
    },

    get visibleCount() {
      return this.visibleItems.length;
    },

    get isFiltered() {
      return (
        this.activeCategory !== 'all' ||
        this.activeMood !== null ||
        this.activeSpirit !== null
      );
    },

    get activeMoodLabel() {
      if (!this.activeMood) return '';
      const found = this.moods.find((m) => m.key === this.activeMood);
      return found ? found.label : this.activeMood;
    },

    get activeSpiritLabel() {
      if (!this.activeSpirit) return '';
      const found = this.spirits.find((s) => s.key === this.activeSpirit);
      return found ? found.label : this.activeSpirit;
    },

    categoryCount(category) {
      return this.items.filter((item) => item.category === category).length;
    },

    categoryVisible(category) {
      return this.visibleItems.some((item) => item.category === category);
    },

    subcategoryVisible(category, subcategory) {
      return this.visibleItems.some(
        (item) => item.category === category && item.subcategory === subcategory
      );
    },

    setCategory(category) {
      this.activeCategory = category;
      this.openDrawer = null;
      if (category === 'Snacks') {
        this.activeMood = null;
        this.activeSpirit = null;
      } else if (category !== 'all' && category !== 'Cocktails') {
        this.activeSpirit = null;
      }
      this.scrollToListTop();
    },

    toggleMood(mood) {
      this.activeMood = this.activeMood === mood ? null : mood;
      this.openDrawer = null;
      this.scrollToListTop();
    },

    toggleSpirit(spirit) {
      this.activeSpirit = this.activeSpirit === spirit ? null : spirit;
      this.openDrawer = null;
      this.scrollToListTop();
    },

    toggleDrawer(drawer) {
      this.openDrawer = this.openDrawer === drawer ? null : drawer;
    },

    clearDrinkFilters() {
      this.activeMood = null;
      this.activeSpirit = null;
      this.openDrawer = null;
      this.scrollToListTop();
    },

    clearMood() {
      this.activeMood = null;
      this.openDrawer = null;
      this.scrollToListTop();
    },

    clearSpirit() {
      this.activeSpirit = null;
      this.openDrawer = null;
      this.scrollToListTop();
    },

    clearFilters() {
      this.activeCategory = 'all';
      this.activeMood = null;
      this.activeSpirit = null;
      this.openDrawer = null;
      this.scrollToListTop();
    },

    // Tapping a filter halfway down a 47-drink list should not strand the guest
    // at the footer. Only act once the sticky bar has reached the top.
    scrollToListTop() {
      // Wait for x-show to remove the hidden sections and settle layout;
      // scrolling before that lets the shrinking page clamp the animation.
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        const bar = document.querySelector('.pv-filterbar');
        const list = document.querySelector('#preview-menu-list');
        if (!bar || !list) return;

        const barTop = bar.getBoundingClientRect().top;
        const listTop =
          list.getBoundingClientRect().top + window.scrollY - bar.offsetHeight - 12;

        if (barTop <= 1 && window.scrollY > listTop) {
          const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches;
          window.scrollTo({
            top: Math.max(0, listTop),
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        }
      }, 80);
    },

    isExpanded(key) {
      return this.openKeys.includes(key);
    },

    toggleItem(key) {
      this.openKeys = this.openKeys.includes(key)
        ? this.openKeys.filter((entry) => entry !== key)
        : [...this.openKeys, key];
    },

    setTheme(mode, persist = true) {
      this.theme = mode === 'paper' ? 'paper' : 'dark';
      document.documentElement.setAttribute('data-preview-theme', this.theme);
      if (persist) {
        try {
          localStorage.setItem(THEME_KEY, this.theme);
        } catch {}
      }
    },

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'paper' : 'dark');
    },
  }));
}
