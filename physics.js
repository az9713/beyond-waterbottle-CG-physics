/* Pure, dimensionless models. u = depth/H, f = volume/full volume. */
(function (root) {
  'use strict';
  const volume = (u, shape = 0) => (1 - shape) * u + shape * u * u;
  const moment = (u, shape = 0) => (1 - shape) * u * u / 2 + 2 * shape * u * u * u / 3;
  function depth(f, shape = 0) {
    if (Math.abs(shape) < 1e-10) return f;
    return 2 * f / ((1 - shape) + Math.sqrt((1 - shape) ** 2 + 4 * shape * f));
  }
  function cg(u, r = 0.125, b = 0.5, shape = 0) {
    return (r * b + moment(u, shape)) / (r + volume(u, shape));
  }
  function minimum(r = 0.125, b = 0.5, shape = 0) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 70; i++) {
      const u = (lo + hi) / 2;
      if (u - cg(u, r, b, shape) > 0) hi = u; else lo = u;
    }
    const u = (lo + hi) / 2;
    return {u, f: volume(u, shape), z: cg(u, r, b, shape)};
  }
  function shared(f, r = 0.125, initial = 0.5) { return (r * initial + f * f / 2) / (r + f); }
  const api = {volume, moment, depth, cg, minimum, shared};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BottlePhysics = api;
})(typeof window === 'undefined' ? globalThis : window);
