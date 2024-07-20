/**
 * Object.freeze() but for all nested objects contained in main object
 *
 * https://www.npmjs.com/package/deep-freeze
 * @param {object} o object to deep freeze
 */
export function deepFreeze (o) {
  Object.freeze(o);
  if (o === undefined) {
    return o;
  }

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });

  return o;
};