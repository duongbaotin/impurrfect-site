import type { Alpine } from 'alpinejs';
import focus from '@alpinejs/focus';
import lightbox from 'alpine-tailwind-lightbox';

export default (Alpine: Alpine) => {
  Alpine.plugin(focus);
  Alpine.plugin(lightbox);
};
