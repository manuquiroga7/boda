import { manejarRsvp } from './rsvp.js';

export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
    if (pathname === '/api/rsvp') return manejarRsvp(req, env);
    return env.ASSETS.fetch(req);
  },
};
