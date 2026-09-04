import type { Alpine } from 'alpinejs';
import focus from '@alpinejs/focus';
import { registerImageViewer } from './viewer';

export default (Alpine: Alpine) => {
  Alpine.plugin(focus);
  registerImageViewer(Alpine);
};
