import { writable } from 'svelte/store';

// Used to makeup time when a user has closed to window and revisited.
export let lastCookieUpdate = writable(0)
export let loadedPage = writable(false);