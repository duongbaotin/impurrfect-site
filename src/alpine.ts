import type { Alpine } from 'alpinejs';
import focus from '@alpinejs/focus';
import { registerImageViewer } from './viewer';
import { registerMenuPreview } from './preview-menu';

export default (Alpine: Alpine) => {
  Alpine.plugin(focus);
  Alpine.store('mobileNav', { open: false });
  registerImageViewer(Alpine);
  registerMenuPreview(Alpine);
};
