// @ts-nocheck
// Preview-only Alpine component shared by /menu-preview's filter bar, section
// wrappers and drink cards. Registered once from src/alpine.ts.

const THEME_KEY = 'impurrfect-menu-preview-theme';

export function registerMenuPreview(Alpine) {
  Alpine.data('menuPreview', () => ({
    items: [],
    activeCategory: 'all',
    activeMood: null,
    expandAll: false,
    openKeys: [],
    closedKeys: [],
    theme: 'dark',
    _onBeforeSwap: null,

    init() {
      try {
        this.items = JSON.parse(this.$el.dataset.items || '[]');
      } catch {
        this.items = [];
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
    },

    itemMatches(item) {
      if (this.activeCategory !== 'all' && item.category !== this.activeCategory) {
        return false;
      }
      if (this.activeMood && !item.moods.includes(this.activeMood)) {
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
      return this.activeCategory !== 'all' || this.activeMood !== null;
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
    },

    toggleMood(mood) {
      this.activeMood = this.activeMood === mood ? null : mood;
    },

    clearFilters() {
      this.activeCategory = 'all';
      this.activeMood = null;
    },

    isExpanded(key) {
      return this.expandAll
        ? !this.closedKeys.includes(key)
        : this.openKeys.includes(key);
    },

    toggleItem(key) {
      if (this.expandAll) {
        this.closedKeys = this.closedKeys.includes(key)
          ? this.closedKeys.filter((entry) => entry !== key)
          : [...this.closedKeys, key];
      } else {
        this.openKeys = this.openKeys.includes(key)
          ? this.openKeys.filter((entry) => entry !== key)
          : [...this.openKeys, key];
      }
    },

    toggleAllExpanded() {
      if (this.expandAll) {
        this.expandAll = false;
        this.openKeys = [];
        this.closedKeys = [];
      } else {
        this.expandAll = true;
        this.closedKeys = [];
      }
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
